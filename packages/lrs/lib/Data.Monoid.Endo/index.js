// Generated by psc version 0.9.3
"use strict";
var Data_Function = require("../Data.Function");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Semigroup = require("../Data.Semigroup");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Control_Category = require("../Control.Category");
var Endo = function (x) {
  return x;
};
var semigroupEndo = new Data_Semigroup.Semigroup(function (v) {
  return function (v1) {
    return function ($10) {
      return v(v1($10));
    };
  };
});
var runEndo = function (v) {
  return v;
};
var monoidEndo = new Data_Monoid.Monoid(function () {
  return semigroupEndo;
}, Control_Category.id(Control_Category.categoryFn));
var invariantEndo = new Data_Functor_Invariant.Invariant(function (ab) {
  return function (ba) {
    return function (v) {
      return function ($11) {
        return ab(v(ba($11)));
      };
    };
  };
});
module.exports = {
  Endo: Endo,
  runEndo: runEndo,
  invariantEndo: invariantEndo,
  semigroupEndo: semigroupEndo,
  monoidEndo: monoidEndo,
};
