import { Party } from "./party";
export declare function RSA_ModulusGeneration(allParties: any[], otherParties: Party[], thisPartyNumber: number, keyLength: bigint, firstParty: Party | null): Promise<readonly [bigint, bigint, bigint]>;
