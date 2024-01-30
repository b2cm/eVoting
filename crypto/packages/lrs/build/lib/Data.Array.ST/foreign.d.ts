export function runSTArray(f: any): any;
export function emptySTArray(): never[];
export function peekSTArrayImpl(just: any): (nothing: any) => (xs: any) => (i: any) => () => any;
export function pokeSTArray(xs: any): (i: any) => (a: any) => () => boolean;
export function pushAllSTArray(xs: any): (as: any) => () => any;
export function spliceSTArray(xs: any): (i: any) => (howMany: any) => (bs: any) => () => any;
export function copyImpl(xs: any): () => any;
export function toAssocArray(xs: any): () => any[];
