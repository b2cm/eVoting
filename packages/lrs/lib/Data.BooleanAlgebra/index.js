// Generated by psc version 0.9.3
"use strict";
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Unit = require("../Data.Unit");
var BooleanAlgebra = function (
  __superclass_Data$dotHeytingAlgebra$dotHeytingAlgebra_0
) {
  this["__superclass_Data.HeytingAlgebra.HeytingAlgebra_0"] =
    __superclass_Data$dotHeytingAlgebra$dotHeytingAlgebra_0;
};
var booleanAlgebraUnit = new BooleanAlgebra(function () {
  return Data_HeytingAlgebra.heytingAlgebraUnit;
});
var booleanAlgebraBoolean = new BooleanAlgebra(function () {
  return Data_HeytingAlgebra.heytingAlgebraBoolean;
});
module.exports = {
  BooleanAlgebra: BooleanAlgebra,
  booleanAlgebraBoolean: booleanAlgebraBoolean,
  booleanAlgebraUnit: booleanAlgebraUnit,
};
