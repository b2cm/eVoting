// Generated by psc version 0.9.3
"use strict";
var Semigroupoid = function (compose) {
  this.compose = compose;
};
var semigroupoidFn = new Semigroupoid(function (f) {
  return function (g) {
    return function (x) {
      return f(g(x));
    };
  };
});
var compose = function (dict) {
  return dict.compose;
};
var composeFlipped = function (dictSemigroupoid) {
  return function (f) {
    return function (g) {
      return compose(dictSemigroupoid)(g)(f);
    };
  };
};
module.exports = {
  Semigroupoid: Semigroupoid,
  compose: compose,
  composeFlipped: composeFlipped,
  semigroupoidFn: semigroupoidFn,
};
