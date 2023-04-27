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

type Socket = IOSocket & { data: { userId: string } };

@WebSocketGateway({ cors: true })
export class LiveGateway implements OnGatewayDisconnect {
  constructor(private appService: AppService) {}

  readonly messages$ = new Subject<{
    from: Socket;
    sessionId: string;
    toId: string;
    message: any;
  }>();

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

  @SubscribeMessage('sendMessage')
  sendMessage(
    @MessageBody() data: { sessionId: string; message: any; toId: string },
    @ConnectedSocket() sock: Socket,
  ) {
    this.messages$.next({ ...data, from: sock });
  }

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
