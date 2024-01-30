export function apply(f: any): (x: any) => any;
export function applyFlipped(x: any): (f: any) => any;
declare function $$const(a: any): (v: any) => any;
export function flip(f: any): (b: any) => (a: any) => any;
export function on(f: any): (g: any) => (x: any) => (y: any) => any;
export { $$const as const };
