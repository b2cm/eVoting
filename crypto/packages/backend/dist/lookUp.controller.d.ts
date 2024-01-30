import { LookUpservice } from './lookup.service';
export declare class LookUpController {
    private lookUpService;
    constructor(lookUpService: LookUpservice);
    GetTable(): Promise<{
        value: string;
        point: string;
    }[]>;
}
