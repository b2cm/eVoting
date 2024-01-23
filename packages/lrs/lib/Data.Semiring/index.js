// Generated by psc version 0.9.3
"use strict";
var $foreign = require("./foreign");
var Data_Unit = require("../Data.Unit");
var Semiring = function (add, mul, one, zero) {
  this.add = add;
  this.mul = mul;
  this.one = one;
  this.zero = zero;
};
var zero = function (dict) {
  return dict.zero;
};
var semiringUnit = new Semiring(
  function (v) {
    return function (v1) {
      return Data_Unit.unit;
    };
  },
  function (v) {
    return function (v1) {
      return Data_Unit.unit;
    };
  },
  Data_Unit.unit,
  Data_Unit.unit
);
var semiringNumber = new Semiring($foreign.numAdd, $foreign.numMul, 1.0, 0.0);
var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);
var one = function (dict) {
  return dict.one;
};
var mul = function (dict) {
  return dict.mul;
};
var add = function (dict) {
  return dict.add;
};
module.exports = {
  Semiring: Semiring,
  add: add,
  mul: mul,
  one: one,
  zero: zero,
  semiringInt: semiringInt,
  semiringNumber: semiringNumber,
  semiringUnit: semiringUnit,
};
