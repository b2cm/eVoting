export declare function createMemberShipZKP(message: bigint, validMessages: bigint[], N: bigint, bits?: bigint): readonly [bigint, readonly [bigint[], bigint[], bigint[]]];
export declare function computeZKPInputs(ciphertext: bigint, proof: bigint[][], validMessages: bigint[], N: bigint): {
    readonly proof: string[][];
    readonly isProofONegativ: boolean[];
    readonly as: string[];
    readonly ias: string[];
    readonly gmk: string[];
    readonly e: string;
};
export declare function verifyMembershipZkp(ciphertext: bigint, [es, us, vs]: [bigint[], bigint[], bigint[]], validMessages: bigint[], N: bigint): boolean;
export declare function ZKP_gen_R(c: bigint, N: bigint, vk: bigint, delta: bigint, keyLength: bigint): readonly [bigint, bigint, bigint];
export declare function ZKP_gen_cc(c: bigint, ci: bigint, vki: bigint, R1: bigint, R2: bigint, vk: bigint, N: bigint): bigint;
export declare function ZKP_comput_z(r: bigint, cc: bigint, fi: bigint): bigint;
export declare function ZKP_check(c: bigint, ci: bigint, R1: bigint, R2: bigint, z: bigint, cc: bigint, vki: bigint, N: bigint, delta: bigint, vk: bigint): boolean;
