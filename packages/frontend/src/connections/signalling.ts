import { fromEvent, map, of, shareReplay } from "rxjs";
import { io, Socket } from "socket.io-client";

export class Signaller {
  constructor(
    private socket: Socket,
    private sessionId: string,
    private userId: string
  ) {}

  readonly userId$ = of(this.userId);

  readonly recieveMessage$ = fromEvent(this.socket, "rtcMessage").pipe(
    map(({ message, from }) => ({
      message: message as any,
      from: from as string,
    })),
    shareReplay({
      refCount: true,
      bufferSize: 30,
    })
  );

  readonly parties$ = fromEvent<{
    parties: Array<{ id: string }>;
  }>(this.socket, "parties").pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );

  sendRTCMessage(partyId: string, message: any) {
    this.socket.emit("sendMessage", {
      sessionId: this.sessionId,
      toId: partyId,
      message,
    });
  }

  cleanup() {
    this.socket.close();
  }
}

export async function createSignaller(sessionId: string, userId?: string) {
  const socket = io("localhost:3100");
  socket.emit("joinSession", { sessionId, userId });

  const rec_userId = await new Promise<string>((res) => {
    socket.once("userId", (userId) => {
      res(userId);
    });
  });

  return new Signaller(socket, sessionId, rec_userId);
}
