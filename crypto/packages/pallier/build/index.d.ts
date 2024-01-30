import { Party } from "./party";
import { Awaited } from "./util/Awaited";
export declare type GeneratedKeys = Awaited<ReturnType<typeof startGeneration>>;
export * from "./zkp";
export * from "./decrypt";
export declare function encrypt(message: bigint, N: bigint, r?: bigint): bigint;
export declare function combineCiphertext(existing: bigint, c: bigint): bigint;
export declare function startGeneration(userId: string, parties: Party[], keyLength?: bigint, threshold?: number): Promise<{
    public: {
        N: bigint;
        theta: bigint;
        delta: bigint;
        vk: bigint;
    };
    private: {
        f: bigint;
        vki: bigint;
    };
    isFirstParty: boolean;
    allParties: {
        id: string;
        number: number;
    }[];
}>;
