import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  delay,
  EMPTY,
  filter,
  map,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Socket as IOSocket } from 'socket.io';
import { AppService } from './app.service';
import { updateBehaviorSubject } from './utils';

/**
 *
 *
 * @typedef {Socket}
 */
type Socket = IOSocket & { data: { userId: string } };

/**
 * This class acts as the websocket server for the live session.
 *
 * We need this server for two main things:
 * 1. To allow the client to negotiate webrtc connections, over which they will
 *    communicate with each other (p2p).
 * 2. To allow the server to relay messages between clients. This is done by maintaining
 *    a record of all parties that are associated to each session
 */

@WebSocketGateway({ cors: true })
export class LiveGateway implements OnGatewayDisconnect {
  /**
   * Creates an instance of LiveGateway.
   *
   * @constructor
   * @param {AppService} appService
   */
  constructor(private appService: AppService) {}

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  readonly messages$ = new Subject<{
    from: Socket;
    sessionId: string;
    toId: string;
    message: any;
  }>();

  /**
   * Cleanup data when a client disconnects. If it was the last party in the session,
   * we also delete the session.
   */
  handleDisconnect(client: Socket) {
    updateBehaviorSubject(this.appService.sessions, (sessions) => {
      const sesId = client.data.sessionId;
      if (!sesId) {
        return sessions;
      }
      const ses = sessions.get(sesId);
      if (!ses) {
        return sessions;
      }
      ses.parties = ses.parties.filter((p) => p.id != client.data.userId);
      if (ses.parties.length == 0) {
        sessions.delete(sesId);
      }
      return sessions;
    });
  }

  /**
   * When a client joins a session, we add them to the session and return the id
   *
   * We also subscribe this client to the following:
   * 1. The list of parties in the session
   * 2. The messages that are sent to this client from another client
   */
  @SubscribeMessage('joinSession')
  joinSession(
    @MessageBody() data: { sessionId: string; userId?: string },
    @ConnectedSocket() sock: Socket,
  ) {
    if (
      data.sessionId.endsWith('decrypt') ||
      this.appService.hasSession(data.sessionId)
    ) {
      const { id } = this.appService.addParty(
        data.sessionId,
        sock,
        data.userId,
      );

      sock.data.userId = id;
      sock.data.sessionId = data.sessionId;

      return merge(
        of({
          event: 'userId',
          data: id,
        }),
        this.partiesInSession(data.sessionId),
        this.incominMessages(data.sessionId, id),
      );
    }
  }

  /**
   * Handle sending message to a single client
   * @param data
   * @param sock
   */
  @SubscribeMessage('sendMessage')
  sendMessage(
    @MessageBody() data: { sessionId: string; message: any; toId: string },
    @ConnectedSocket() sock: Socket,
  ) {
    this.messages$.next({ ...data, from: sock });
  }

  /**
   * Utility function for subscribing a client to stream of messages are
   * directed towards that client
   *
   * @param sessionId Session ID
   * @param uId User Id of the client
   */
  incominMessages(sessionId: string, uId: string) {
    return this.messages$.pipe(
      filter((m) => m.sessionId === sessionId && m.toId === uId),
      map((m) => ({
        event: 'rtcMessage',
        data: {
          message: m.message,
          from: m.from.data.userId,
        },
      })),
    );
  }

  /**
   * Get the live list of parties in a session
   *
   * @param id Session ID
   */
  partiesInSession(id: string) {
    return this.appService.sessions.pipe(
      startWith(this.appService.sessions.getValue()),
      map((ses) => ses.get(id)),
      switchMap((ses) => {
        if (!ses) {
          return EMPTY;
        } else {
          return of(ses.parties.map((party) => ({ id: party.id })));
        }
      }),
      delay(1000),
      map((parties) => ({
        event: 'parties',
        data: { parties },
      })),
    );
  }
}
