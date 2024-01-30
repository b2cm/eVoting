export default class Point {
    static SECP256K1: Point;
    static ZERO: Point;
    private _compressed_lazy?;
    private _x_lazy?;
    private _y_lazy?;
    private precomputes;
    private constructor();
    get x(): bigint;
    get y(): bigint;
    add: (p: Point) => Point;
    double: () => Point;
    getPrecomputes: () => Point[];
    multiplyCT: (n: bigint) => Point;
    invert(): Point;
    get compressed(): bigint;
    static fromXYPair(x: bigint, y: bigint): Point;
    static fromCompressed(comp: bigint): Point;
}
