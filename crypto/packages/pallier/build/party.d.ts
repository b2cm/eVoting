import { Observable } from "rxjs";
export interface Party {
    readonly partyId: string;
    send(message: string): void;
    bufferedMessage$: Observable<string>;
}
