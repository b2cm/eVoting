import { gen, sign, verify, link } from "./lib/Crypto.LRS.SimpleAPI";

const alice = gen();
const bob = gen();
const frank = gen();

console.log("Alice: ", alice);
console.log("Bob: ", bob);
console.log("Frank: ", frank);

const ring = [alice, bob, frank].map((p) => p.value0);

const message = "hello world";
const message2 = "hello alice";

const signed = sign(ring)(alice)(message)();

console.log(verify(ring)(signed)(message));

const signed2 = sign(ring)(alice)(message2)();

console.log(verify(ring)(signed2)(message2));

console.log(link(signed)(signed2))
