// Generated by psc version 0.9.3
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Data_Foldable = require("../Data.Foldable");
var Data_Functor = require("../Data.Functor");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Maybe_Last = require("../Data.Maybe.Last");
var Data_Monoid_Additive = require("../Data.Monoid.Additive");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var StateL = function (x) {
  return x;
};
var StateR = function (x) {
  return x;
};
var Traversable = function (
  __superclass_Data$dotFoldable$dotFoldable_1,
  __superclass_Data$dotFunctor$dotFunctor_0,
  sequence,
  traverse
) {
  this["__superclass_Data.Foldable.Foldable_1"] =
    __superclass_Data$dotFoldable$dotFoldable_1;
  this["__superclass_Data.Functor.Functor_0"] =
    __superclass_Data$dotFunctor$dotFunctor_0;
  this.sequence = sequence;
  this.traverse = traverse;
};
var traverse = function (dict) {
  return dict.traverse;
};
var traversableMultiplicative = new Traversable(
  function () {
    return Data_Foldable.foldableMultiplicative;
  },
  function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Monoid_Multiplicative.Multiplicative)(v);
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Monoid_Multiplicative.Multiplicative)(f(v));
      };
    };
  }
);
var traversableMaybe = new Traversable(
  function () {
    return Data_Foldable.foldableMaybe;
  },
  function () {
    return Data_Maybe.functorMaybe;
  },
  function (dictApplicative) {
    return function (v) {
      if (v instanceof Data_Maybe.Nothing) {
        return Control_Applicative.pure(dictApplicative)(
          Data_Maybe.Nothing.value
        );
      }
      if (v instanceof Data_Maybe.Just) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Maybe.Just.create)(v.value0);
      }
      throw new Error(
        "Failed pattern match at Data.Traversable line 88, column 3 - line 88, column 35: " +
          [v.constructor.name]
      );
    };
  },
  function (dictApplicative) {
    return function (v) {
      return function (v1) {
        if (v1 instanceof Data_Maybe.Nothing) {
          return Control_Applicative.pure(dictApplicative)(
            Data_Maybe.Nothing.value
          );
        }
        if (v1 instanceof Data_Maybe.Just) {
          return Data_Functor.map(
            dictApplicative["__superclass_Control.Apply.Apply_0"]()[
              "__superclass_Data.Functor.Functor_0"
            ]()
          )(Data_Maybe.Just.create)(v(v1.value0));
        }
        throw new Error(
          "Failed pattern match at Data.Traversable line 86, column 3 - line 86, column 37: " +
            [v.constructor.name, v1.constructor.name]
        );
      };
    };
  }
);
var traversableDual = new Traversable(
  function () {
    return Data_Foldable.foldableDual;
  },
  function () {
    return Data_Monoid_Dual.functorDual;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Monoid_Dual.Dual)(v);
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Monoid_Dual.Dual)(f(v));
      };
    };
  }
);
var traversableDisj = new Traversable(
  function () {
    return Data_Foldable.foldableDisj;
  },
  function () {
    return Data_Monoid_Disj.functorDisj;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Monoid_Disj.Disj)(v);
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Monoid_Disj.Disj)(f(v));
      };
    };
  }
);
var traversableConj = new Traversable(
  function () {
    return Data_Foldable.foldableConj;
  },
  function () {
    return Data_Monoid_Conj.functorConj;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Monoid_Conj.Conj)(v);
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Monoid_Conj.Conj)(f(v));
      };
    };
  }
);
var traversableAdditive = new Traversable(
  function () {
    return Data_Foldable.foldableAdditive;
  },
  function () {
    return Data_Monoid_Additive.functorAdditive;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Monoid_Additive.Additive)(v);
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Monoid_Additive.Additive)(f(v));
      };
    };
  }
);
var stateR = function (v) {
  return v;
};
var stateL = function (v) {
  return v;
};
var sequenceDefault = function (dictTraversable) {
  return function (dictApplicative) {
    return function (tma) {
      return traverse(dictTraversable)(dictApplicative)(
        Control_Category.id(Control_Category.categoryFn)
      )(tma);
    };
  };
};
var traversableArray = new Traversable(
  function () {
    return Data_Foldable.foldableArray;
  },
  function () {
    return Data_Functor.functorArray;
  },
  function (dictApplicative) {
    return sequenceDefault(traversableArray)(dictApplicative);
  },
  function (dictApplicative) {
    return $foreign.traverseArrayImpl(
      Control_Apply.apply(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()
      )
    )(
      Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )
    )(Control_Applicative.pure(dictApplicative));
  }
);
var sequence = function (dict) {
  return dict.sequence;
};
var traversableFirst = new Traversable(
  function () {
    return Data_Foldable.foldableFirst;
  },
  function () {
    return Data_Maybe_First.functorFirst;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Maybe_First.First)(sequence(traversableMaybe)(dictApplicative)(v));
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Maybe_First.First)(
          traverse(traversableMaybe)(dictApplicative)(f)(v)
        );
      };
    };
  }
);
var traversableLast = new Traversable(
  function () {
    return Data_Foldable.foldableLast;
  },
  function () {
    return Data_Maybe_Last.functorLast;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(Data_Maybe_Last.Last)(sequence(traversableMaybe)(dictApplicative)(v));
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(Data_Maybe_Last.Last)(
          traverse(traversableMaybe)(dictApplicative)(f)(v)
        );
      };
    };
  }
);
var traverseDefault = function (dictTraversable) {
  return function (dictApplicative) {
    return function (f) {
      return function (ta) {
        return sequence(dictTraversable)(dictApplicative)(
          Data_Functor.map(
            dictTraversable["__superclass_Data.Functor.Functor_0"]()
          )(f)(ta)
        );
      };
    };
  };
};
var functorStateR = new Data_Functor.Functor(function (f) {
  return function (k) {
    return function (s) {
      var $75 = stateR(k)(s);
      return {
        accum: $75.accum,
        value: f($75.value),
      };
    };
  };
});
var functorStateL = new Data_Functor.Functor(function (f) {
  return function (k) {
    return function (s) {
      var $78 = stateL(k)(s);
      return {
        accum: $78.accum,
        value: f($78.value),
      };
    };
  };
});
var $$for = function (dictApplicative) {
  return function (dictTraversable) {
    return function (x) {
      return function (f) {
        return traverse(dictTraversable)(dictApplicative)(f)(x);
      };
    };
  };
};
var applyStateR = new Control_Apply.Apply(
  function () {
    return functorStateR;
  },
  function (f) {
    return function (x) {
      return function (s) {
        var $81 = stateR(x)(s);
        var $82 = stateR(f)($81.accum);
        return {
          accum: $82.accum,
          value: $82.value($81.value),
        };
      };
    };
  }
);
var applyStateL = new Control_Apply.Apply(
  function () {
    return functorStateL;
  },
  function (f) {
    return function (x) {
      return function (s) {
        var $87 = stateL(f)(s);
        var $88 = stateL(x)($87.accum);
        return {
          accum: $88.accum,
          value: $87.value($88.value),
        };
      };
    };
  }
);
var applicativeStateR = new Control_Applicative.Applicative(
  function () {
    return applyStateR;
  },
  function (a) {
    return function (s) {
      return {
        accum: s,
        value: a,
      };
    };
  }
);
var mapAccumR = function (dictTraversable) {
  return function (f) {
    return function (s0) {
      return function (xs) {
        return stateR(
          traverse(dictTraversable)(applicativeStateR)(function (a) {
            return function (s) {
              return f(s)(a);
            };
          })(xs)
        )(s0);
      };
    };
  };
};
var scanr = function (dictTraversable) {
  return function (f) {
    return function (b0) {
      return function (xs) {
        return mapAccumR(dictTraversable)(function (b) {
          return function (a) {
            var b$prime = f(a)(b);
            return {
              accum: b$prime,
              value: b$prime,
            };
          };
        })(b0)(xs).value;
      };
    };
  };
};
var applicativeStateL = new Control_Applicative.Applicative(
  function () {
    return applyStateL;
  },
  function (a) {
    return function (s) {
      return {
        accum: s,
        value: a,
      };
    };
  }
);
var mapAccumL = function (dictTraversable) {
  return function (f) {
    return function (s0) {
      return function (xs) {
        return stateL(
          traverse(dictTraversable)(applicativeStateL)(function (a) {
            return function (s) {
              return f(s)(a);
            };
          })(xs)
        )(s0);
      };
    };
  };
};
var scanl = function (dictTraversable) {
  return function (f) {
    return function (b0) {
      return function (xs) {
        return mapAccumL(dictTraversable)(function (b) {
          return function (a) {
            var b$prime = f(b)(a);
            return {
              accum: b$prime,
              value: b$prime,
            };
          };
        })(b0)(xs).value;
      };
    };
  };
};
module.exports = {
  Traversable: Traversable,
  for: $$for,
  mapAccumL: mapAccumL,
  mapAccumR: mapAccumR,
  scanl: scanl,
  scanr: scanr,
  sequence: sequence,
  sequenceDefault: sequenceDefault,
  traverse: traverse,
  traverseDefault: traverseDefault,
  traversableArray: traversableArray,
  traversableMaybe: traversableMaybe,
  traversableFirst: traversableFirst,
  traversableLast: traversableLast,
  traversableAdditive: traversableAdditive,
  traversableDual: traversableDual,
  traversableConj: traversableConj,
  traversableDisj: traversableDisj,
  traversableMultiplicative: traversableMultiplicative,
};
