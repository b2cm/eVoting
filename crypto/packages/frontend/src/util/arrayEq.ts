export function ArrayEq(arr: any[], brr: any[]) {
  if (arr.length !== brr.length) return false;
  return arr.every((a) => brr.some((b) => a === b));
}
