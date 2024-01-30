export function newSTRef(val: any): () => {
    value: any;
};
export function readSTRef(ref: any): () => any;
export function modifySTRef(ref: any): (f: any) => () => any;
export function writeSTRef(ref: any): (a: any) => () => any;
export function runST(f: any): any;
