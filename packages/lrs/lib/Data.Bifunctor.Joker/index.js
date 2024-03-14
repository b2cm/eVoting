// Generated by psc version 0.9.3
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Functor = require("../Data.Functor");
var Joker = function (x) {
  return x;
};
var runJoker = function (v) {
  return v;
};
var functorJoker = function (dictFunctor) {
  return new Data_Functor.Functor(function (g) {
    return function ($12) {
      return Joker(Data_Functor.map(dictFunctor)(g)(runJoker($12)));
    };
  });
};
var bifunctorJoker = function (dictFunctor) {
  return new Data_Bifunctor.Bifunctor(function (v) {
    return function (g) {
      return function ($13) {
        return Joker(Data_Functor.map(dictFunctor)(g)(runJoker($13)));
      };
    };
  });
};
var biapplyJoker = function (dictApply) {
  return new Control_Biapply.Biapply(
    function () {
      return bifunctorJoker(dictApply["__superclass_Data.Functor.Functor_0"]());
    },
    function (v) {
      return function (v1) {
        return Control_Apply.apply(dictApply)(v)(v1);
      };
    }
  );
};
var biapplicativeJoker = function (dictApplicative) {
  return new Control_Biapplicative.Biapplicative(
    function () {
      return biapplyJoker(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()
      );
    },
    function (v) {
      return function (b) {
        return Control_Applicative.pure(dictApplicative)(b);
      };
    }
  );
};
module.exports = {
  Joker: Joker,
  runJoker: runJoker,
  functorJoker: functorJoker,
  bifunctorJoker: bifunctorJoker,
  biapplyJoker: biapplyJoker,
  biapplicativeJoker: biapplicativeJoker,
};