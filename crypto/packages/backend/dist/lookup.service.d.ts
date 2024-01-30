import { LookupTable } from './entities/lookup.entity';
import { Connection, Repository } from 'typeorm';
import { Point } from 'elgammal';
export declare class LookUpservice {
    private lookUpTableRep;
    private connection;
    constructor(lookUpTableRep: Repository<LookupTable>, connection: Connection);
    add(value: bigint, point: Point): Promise<void>;
    getAll(): Promise<{
        value: string;
        point: string;
    }[]>;
}
