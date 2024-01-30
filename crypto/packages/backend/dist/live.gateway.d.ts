import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Subject } from 'rxjs';
import { Socket as IOSocket } from 'socket.io';
import { AppService } from './app.service';
declare type Socket = IOSocket & {
    data: {
        userId: string;
    };
};
export declare class LiveGateway implements OnGatewayDisconnect {
    private appService;
    constructor(appService: AppService);
    readonly messages$: Subject<{
        from: Socket;
        sessionId: string;
        toId: string;
        message: any;
    }>;
    handleDisconnect(client: Socket): void;
    joinSession(data: {
        sessionId: string;
        userId?: string;
    }, sock: Socket): import("rxjs").Observable<{
        event: string;
        data: string;
    } | {
        event: string;
        data: {
            parties: {
                id: string;
            }[];
        };
    } | {
        event: string;
        data: {
            message: any;
            from: string;
        };
    }> | undefined;
    sendMessage(data: {
        sessionId: string;
        message: any;
        toId: string;
    }, sock: Socket): void;
    incominMessages(sessionId: string, uId: string): import("rxjs").Observable<{
        event: string;
        data: {
            message: any;
            from: string;
        };
    }>;
    partiesInSession(id: string): import("rxjs").Observable<{
        event: string;
        data: {
            parties: {
                id: string;
            }[];
        };
    }>;
}
export {};
