export function pureST(st: any): any;
export declare const modifySTRef: (ref: any) => (f: any) => () => any;
export declare const newSTRef: (val: any) => () => {
    value: any;
};
export declare const readSTRef: (ref: any) => () => any;
export declare const runST: (f: any) => any;
export declare const writeSTRef: (ref: any) => (a: any) => () => any;
