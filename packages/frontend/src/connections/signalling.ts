import { fromEvent, map, of, shareReplay } from "rxjs";
import { io, Socket } from "socket.io-client";

/**
 * This class interacts with the websocket server on the backend
 *
 * We have functions here to negotiate a WebRTC connection with the server
 *
 *
 * @export
 * @class Signaller
 * @typedef {Signaller}
 */
export class Signaller {
  /**
   * Creates an instance of Signaller.
   *
   * @constructor
   * @param {Socket} socket
   * @param {string} sessionId
   * @param {string} userId
   */
  constructor(
    private socket: Socket,
    private sessionId: string,
    private userId: string
  ) {}

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  readonly userId$ = of(this.userId);

  /**
   *
   *
   * @readonly
   * @type {*}
   */
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

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  readonly parties$ = fromEvent<{
    parties: Array<{ id: string }>;
  }>(this.socket, "parties").pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );

  /**
   *
   *
   * @param {string} partyId
   * @param {*} message
   */
  sendRTCMessage(partyId: string, message: any) {
    this.socket.emit("sendMessage", {
      sessionId: this.sessionId,
      toId: partyId,
      message,
    });
  }

  /**
   *
   */
  cleanup() {
    this.socket.close();
  }
}

/**
 * Factory function which connects a websocket to the server, and creates
 * a Signaller object
 *
 * @export
 * @async
 * @param {string} sessionId
 * @param {?string} [userId]
 * @returns {unknown}
 */
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
