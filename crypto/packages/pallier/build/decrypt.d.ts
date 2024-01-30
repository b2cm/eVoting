import { Party } from "./party";
export declare function decrypt(ciphertext: bigint, userId: string, parties: Party[], partyNumbers: {
    id: string;
    number: number;
}[], N: bigint, delta: bigint, theta: bigint, vk: bigint, fi: bigint, vki: bigint, candidates: bigint[], keyLength?: bigint, threshold?: number): Promise<{
    candidate: bigint;
    votes: bigint;
}[]>;
