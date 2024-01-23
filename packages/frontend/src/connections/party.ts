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

/**
 * Class for interacting with another party
 *
 * We can send and recieve webrtc messages over this connection
 *
 * @export
 * @class Party
 */
export class Party {
  constructor(
    readonly partyId: string,
    private pc: RTCPeerConnection,
    private channel: RTCDataChannel,
    private teardown: Subscription
  ) {
    this._bufferMessages();
    //this.vrfNumber = VrfGenerator();
  }
  private _messageBuffer = new Queue<string>();
  private _messagesAvailable$ = new Subject<string>();
  //public vrfNumber : any;

  readonly ready$ = new BehaviorSubject(false);

  readonly vrf$ = new BehaviorSubject(null);

  /**
   * To reduce the chance of dropped messages, we buffer any incoming messages, and then process them in order
   */
  private _bufferMessages() {
    this.channel.onmessage = ({ data }) => {
      console.log("message recieved from: " + this.partyId, data);
      try {
        const m = JSON.parse(data);
        if ("ready" in m) {
          this.ready$.next(m.ready);
          this.vrf$.next(m.vrfNumber);
        } else {
          throw new Error();
        }
      } catch (e) {
        this._messageBuffer.enque(data);
        this._messagesAvailable$.next(data);
      }
    };
  }
  // read
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

  /**
   * Send a message to the other party
   *
   */
  send(data: string) {
    this.channel.send(data);
  }

  /**
   * Teardown this connection and clean up
   */
  cleanup() {
    this.teardown.unsubscribe();
    this.channel.close();
    this.pc.close();
  }

  /**
   * For sending a ready message to the other party
   */
  sendReady(ready: boolean, vrfNumber?: any) {
    this.channel.send(
      JSON.stringify({
        ready,
        vrfNumber,
      })
    );
  }
}

/**
 * This function creates a new party connection.
 * It does this by creating a new RTCPeerConnection, and then setting up the necessary event handlers
 * The overall flow is a very basic WebRTC negotiation flow (https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
 * @param ourId
 * @param partyId
 * @param signaller
 * @returns
 */
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
