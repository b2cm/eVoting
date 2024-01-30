export function pureE(a: any): () => any;
export function bindE(a: any): (f: any) => () => any;
export function runPure(f: any): any;
export function untilE(f: any): () => {};
export function whileE(f: any): (a: any) => () => {};
export function forE(lo: any): (hi: any) => (f: any) => () => void;
export function foreachE(as: any): (f: any) => () => void;
