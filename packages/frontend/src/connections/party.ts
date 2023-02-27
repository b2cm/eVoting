import {
  BehaviorSubject,
  filter,
  first,
  firstValueFrom,
  fromEvent,
  map,
  mapTo,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from "rxjs";
import { Queue } from "../util/queue";
import { Signaller } from "./signalling";

//represents a connection with another party

const baseConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
export class Party {
  constructor(
    readonly partyId: string,
    private pc: RTCPeerConnection,
    private channel: RTCDataChannel,
    private teardown: Subscription
  ) {
    this._bufferMessages();
  }
  private _messageBuffer = new Queue<string>();
  private _messagesAvailable$ = new Subject<string>();

  readonly ready$ = new BehaviorSubject(false);

  private _bufferMessages() {
    this.channel.onmessage = ({ data }) => {
      console.log("message recieved from: " + this.partyId, data);
      try {
        const m = JSON.parse(data);
        if ("ready" in m) {
          this.ready$.next(m.ready);
        } else {
          throw new Error();
        }
      } catch (e) {
        this._messageBuffer.enque(data);
        this._messagesAvailable$.next(data);
      }
    };
  }

  get bufferedMessage$(): Observable<string> {
    if (!this._messageBuffer.isEmpty()) {
      return of(this._messageBuffer.dequeue() as string).pipe(
        filter((m) => {
          try {
            return !("ready" in JSON.parse(m));
          } catch (e) {
            return true;
          }
        })
      );
    } else {
      return this._messagesAvailable$.pipe(
        switchMap(() => this.bufferedMessage$),
        first()
      );
    }
  }

  send(data: string) {
    this.channel.send(data);
  }

  cleanup() {
    this.teardown.unsubscribe();
    this.channel.close();
    this.pc.close();
  }

  sendReady(ready: boolean) {
    this.channel.send(
      JSON.stringify({
        ready,
      })
    );
  }
}

export async function createParty(
  ourId: string,
  partyId: string,
  signaller: Signaller
) {
  const pc = new RTCPeerConnection(baseConfig);
  let makingOffer = false;
  let ignoreOffer = false;
  const polite = ourId.localeCompare(partyId) > 0;

  const dataChannel$ = polite //if we are polite, wait for the other peer to create data channel
    ? fromEvent<RTCDataChannelEvent>(pc, "datachannel").pipe(
        map(({ channel }) => channel)
      )
    : of(pc.createDataChannel("data"));

  const startNegotiation$ = fromEvent(pc, "negotiationneeded").pipe(
    switchMap(async () => {
      console.log(partyId, "starting neg");
      try {
        makingOffer = true;
        await pc.setLocalDescription();
        signaller.sendRTCMessage(partyId, {
          description: pc.localDescription,
        });
      } catch (err) {
        console.error(err);
      } finally {
        makingOffer = false;
      }
    })
  );

  const sendCandidate$ = fromEvent<RTCPeerConnectionIceEvent>(
    pc,
    "icecandidate"
  ).pipe(
    tap(({ candidate }) => {
      signaller.sendRTCMessage(partyId, { candidate });
    })
  );

  const handleIncoming$ = signaller.recieveMessage$.pipe(
    filter(({ from }) => from === partyId),
    tap(async ({ message: { description, candidate } }) => {
      try {
        if (description) {
          console.log(partyId, "incoming neg/answer");
          const offerCollision =
            description.type === "offer" &&
            (makingOffer || pc.signalingState !== "stable");

          ignoreOffer = !polite && offerCollision;
          if (ignoreOffer) {
            return;
          }

          await pc.setRemoteDescription(description);
          if (description.type === "offer") {
            console.log(partyId, "recieved offer, replying...");
            await pc.setLocalDescription();
            signaller.sendRTCMessage(partyId, {
              description: pc.localDescription,
            });
          } else {
            console.log(partyId, "recieved answer");
          }
        } else if (candidate) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            if (!ignoreOffer) {
              throw err;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    })
  );

  const subs = new Subscription();
  subs.add(startNegotiation$.subscribe());
  subs.add(handleIncoming$.subscribe());
  subs.add(sendCandidate$.subscribe());

  const channel = await firstValueFrom(
    dataChannel$.pipe(
      switchMap((c) =>
        c.readyState === "open" ? of(c) : fromEvent(c, "open").pipe(mapTo(c))
      )
    )
  );

  return new Party(partyId, pc, channel, subs);
}
