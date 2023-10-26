// Generated by psc version 0.9.3
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Dual = function (x) {
  return x;
};
var showDual = function (dictShow) {
  return new Data_Show.Show(function (v) {
    return "(Dual " + (Data_Show.show(dictShow)(v) + ")");
  });
};
var semigroupDual = function (dictSemigroup) {
  return new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
      return Data_Semigroup.append(dictSemigroup)(v1)(v);
    };
  });
};
var runDual = function (v) {
  return v;
};
var monoidDual = function (dictMonoid) {
  return new Data_Monoid.Monoid(function () {
    return semigroupDual(
      dictMonoid["__superclass_Data.Semigroup.Semigroup_0"]()
    );
  }, Data_Monoid.mempty(dictMonoid));
};
var invariantDual = new Data_Functor_Invariant.Invariant(function (f) {
  return function (v) {
    return function (v1) {
      return f(v1);
    };
  };
});
var functorDual = new Data_Functor.Functor(function (f) {
  return function (v) {
    return f(v);
  };
});
var extendDual = new Control_Extend.Extend(
  function () {
    return functorDual;
  },
  function (f) {
    return function (x) {
      return f(x);
    };
  }
);
var eqDual = function (dictEq) {
  return new Data_Eq.Eq(function (v) {
    return function (v1) {
      return Data_Eq.eq(dictEq)(v)(v1);
    };
  });
};
var ordDual = function (dictOrd) {
  return new Data_Ord.Ord(
    function () {
      return eqDual(dictOrd["__superclass_Data.Eq.Eq_0"]());
    },
    function (v) {
      return function (v1) {
        return Data_Ord.compare(dictOrd)(v)(v1);
      };
    }
  );
};
var comonadDual = new Control_Comonad.Comonad(function () {
  return extendDual;
}, runDual);
var boundedDual = function (dictBounded) {
  return new Data_Bounded.Bounded(
    function () {
      return ordDual(dictBounded["__superclass_Data.Ord.Ord_0"]());
    },
    Data_Bounded.bottom(dictBounded),
    Data_Bounded.top(dictBounded)
  );
};
var applyDual = new Control_Apply.Apply(
  function () {
    return functorDual;
  },
  function (v) {
    return function (v1) {
      return v(v1);
    };
  }
);
var bindDual = new Control_Bind.Bind(
  function () {
    return applyDual;
  },
  function (v) {
    return function (f) {
      return f(v);
    };
  }
);
var applicativeDual = new Control_Applicative.Applicative(function () {
  return applyDual;
}, Dual);
var monadDual = new Control_Monad.Monad(
  function () {
    return applicativeDual;
  },
  function () {
    return bindDual;
  }
);
module.exports = {
  Dual: Dual,
  runDual: runDual,
  eqDual: eqDual,
  ordDual: ordDual,
  boundedDual: boundedDual,
  functorDual: functorDual,
  invariantDual: invariantDual,
  applyDual: applyDual,
  applicativeDual: applicativeDual,
  bindDual: bindDual,
  monadDual: monadDual,
  extendDual: extendDual,
  comonadDual: comonadDual,
  showDual: showDual,
  semigroupDual: semigroupDual,
  monoidDual: monoidDual,
};
