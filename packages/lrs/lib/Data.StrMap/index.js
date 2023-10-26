// Generated by psc version 0.9.3
"use strict";
var $foreign = require("./foreign");
var Prelude = require("../Prelude");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_ST = require("../Control.Monad.ST");
var Data_Foldable = require("../Data.Foldable");
var Data_Function_Uncurried = require("../Data.Function.Uncurried");
var Data_List = require("../Data.List");
var Data_Maybe = require("../Data.Maybe");
var Data_Monoid = require("../Data.Monoid");
var Data_StrMap_ST = require("../Data.StrMap.ST");
var Data_Traversable = require("../Data.Traversable");
var Data_Tuple = require("../Data.Tuple");
var Data_Functor = require("../Data.Functor");
var Data_Function = require("../Data.Function");
var Control_Apply = require("../Control.Apply");
var Control_Applicative = require("../Control.Applicative");
var Control_Category = require("../Control.Category");
var Data_Eq = require("../Data.Eq");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Show = require("../Data.Show");
var Data_Semigroup = require("../Data.Semigroup");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Control_Bind = require("../Control.Bind");
var values = function ($38) {
  return Data_List.fromFoldable(Data_Foldable.foldableArray)(
    $foreign._collect(function (v) {
      return function (v1) {
        return v1;
      };
    })($38)
  );
};
var toList = function ($39) {
  return Data_List.fromFoldable(Data_Foldable.foldableArray)(
    $foreign._collect(Data_Tuple.Tuple.create)($39)
  );
};
var thawST = $foreign._copyEff;
var showStrMap = function (dictShow) {
  return new Data_Show.Show(function (m) {
    return (
      "fromList " +
      Data_Show.show(
        Data_List.showList(Data_Tuple.showTuple(Data_Show.showString)(dictShow))
      )(toList(m))
    );
  });
};
var pureST = function (f) {
  return Control_Monad_Eff.runPure($foreign.runST(f));
};
var singleton = function (k) {
  return function (v) {
    return pureST(function __do() {
      var v1 = Data_StrMap_ST["new"]();
      Data_StrMap_ST.poke(v1)(k)(v)();
      return v1;
    });
  };
};
var mutate = function (f) {
  return function (m) {
    return pureST(function __do() {
      var v = thawST(m)();
      f(v)();
      return v;
    });
  };
};
var member = Data_Function_Uncurried.runFn4($foreign._lookup)(false)(
  Data_Function["const"](true)
);
var lookup = Data_Function_Uncurried.runFn4($foreign._lookup)(
  Data_Maybe.Nothing.value
)(Data_Maybe.Just.create);
var isSubmap = function (dictEq) {
  return function (m1) {
    return function (m2) {
      var f = function (k) {
        return function (v) {
          return $foreign._lookup(false, Data_Eq.eq(dictEq)(v), k, m2);
        };
      };
      return $foreign.all(f)(m1);
    };
  };
};
var isEmpty = $foreign.all(function (v) {
  return function (v1) {
    return false;
  };
});
var insert = function (k) {
  return function (v) {
    return mutate(function (s) {
      return Data_StrMap_ST.poke(s)(k)(v);
    });
  };
};
var functorStrMap = new Data_Functor.Functor(function (f) {
  return function (m) {
    return $foreign._fmapStrMap(m, f);
  };
});
var fromFoldableWith = function (dictFoldable) {
  return function (f) {
    return function (l) {
      return pureST(function __do() {
        var v = Data_StrMap_ST["new"]();
        Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(dictFoldable)(l)(
          function (v1) {
            return Control_Bind.bind(Control_Monad_Eff.bindEff)(
              $foreign._lookupST(v1.value1, f(v1.value1), v1.value0, v)
            )(Data_StrMap_ST.poke(v)(v1.value0));
          }
        )();
        return v;
      });
    };
  };
};
var fromListWith = fromFoldableWith(Data_List.foldableList);
var fromFoldable = function (dictFoldable) {
  return function (l) {
    return pureST(function __do() {
      var v = Data_StrMap_ST["new"]();
      Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(dictFoldable)(l)(
        function (v1) {
          return Data_StrMap_ST.poke(v)(v1.value0)(v1.value1);
        }
      )();
      return v;
    });
  };
};
var fromList = fromFoldable(Data_List.foldableList);
var freezeST = $foreign._copyEff;
var foldMaybe = function (f) {
  return function (z) {
    return function (m) {
      return $foreign._foldSCStrMap(m, z, f, Data_Maybe.fromMaybe);
    };
  };
};
var foldM = function (dictMonad) {
  return function (f) {
    return function (z) {
      return $foreign._foldM(
        Control_Bind.bind(dictMonad["__superclass_Control.Bind.Bind_1"]())
      )(f)(
        Control_Applicative.pure(
          dictMonad["__superclass_Control.Applicative.Applicative_0"]()
        )(z)
      );
    };
  };
};
var semigroupStrMap = function (dictSemigroup) {
  return new Data_Semigroup.Semigroup(function (m1) {
    return function (m2) {
      return mutate(function (s1) {
        return foldM(Control_Monad_Eff.monadEff)(function (s2) {
          return function (k) {
            return function (v2) {
              return Data_StrMap_ST.poke(s2)(k)(
                $foreign._lookup(
                  v2,
                  function (v1) {
                    return Data_Semigroup.append(dictSemigroup)(v1)(v2);
                  },
                  k,
                  m2
                )
              );
            };
          };
        })(s1)(m1);
      })(m2);
    };
  });
};
var monoidStrMap = function (dictSemigroup) {
  return new Data_Monoid.Monoid(function () {
    return semigroupStrMap(dictSemigroup);
  }, $foreign.empty);
};
var union = function (m) {
  return mutate(function (s) {
    return foldM(Control_Monad_Eff.monadEff)(Data_StrMap_ST.poke)(s)(m);
  });
};
var unions = Data_Foldable.foldl(Data_List.foldableList)(union)($foreign.empty);
var fold = $foreign._foldM(Data_Function.applyFlipped);
var foldMap = function (dictMonoid) {
  return function (f) {
    return fold(function (acc) {
      return function (k) {
        return function (v) {
          return Data_Semigroup.append(
            dictMonoid["__superclass_Data.Semigroup.Semigroup_0"]()
          )(acc)(f(k)(v));
        };
      };
    })(Data_Monoid.mempty(dictMonoid));
  };
};
var foldableStrMap = new Data_Foldable.Foldable(
  function (dictMonoid) {
    return function (f) {
      return foldMap(dictMonoid)(Data_Function["const"](f));
    };
  },
  function (f) {
    return fold(function (z) {
      return function (v) {
        return f(z);
      };
    });
  },
  function (f) {
    return function (z) {
      return function (m) {
        return Data_Foldable.foldr(Data_List.foldableList)(f)(z)(values(m));
      };
    };
  }
);
var traversableStrMap = new Data_Traversable.Traversable(
  function () {
    return foldableStrMap;
  },
  function () {
    return functorStrMap;
  },
  function (dictApplicative) {
    return Data_Traversable.traverse(traversableStrMap)(dictApplicative)(
      Control_Category.id(Control_Category.categoryFn)
    );
  },
  function (dictApplicative) {
    return function (f) {
      return function (ms) {
        return Data_Foldable.foldr(Data_List.foldableList)(function (x) {
          return function (acc) {
            return Control_Apply.apply(
              dictApplicative["__superclass_Control.Apply.Apply_0"]()
            )(
              Data_Functor.map(
                dictApplicative["__superclass_Control.Apply.Apply_0"]()[
                  "__superclass_Data.Functor.Functor_0"
                ]()
              )(union)(x)
            )(acc);
          };
        })(Control_Applicative.pure(dictApplicative)($foreign.empty))(
          Data_Functor.map(Data_List.functorList)(
            Data_Functor.map(
              dictApplicative["__superclass_Control.Apply.Apply_0"]()[
                "__superclass_Data.Functor.Functor_0"
              ]()
            )(Data_Tuple.uncurry(singleton))
          )(
            Data_Functor.map(Data_List.functorList)(
              Data_Traversable.traverse(Data_Tuple.traversableTuple)(
                dictApplicative
              )(f)
            )(toList(ms))
          )
        );
      };
    };
  }
);
var eqStrMap = function (dictEq) {
  return new Data_Eq.Eq(function (m1) {
    return function (m2) {
      return isSubmap(dictEq)(m1)(m2) && isSubmap(dictEq)(m2)(m1);
    };
  });
};
var $$delete = function (k) {
  return mutate(function (s) {
    return Data_StrMap_ST["delete"](s)(k);
  });
};
var pop = function (k) {
  return function (m) {
    return Data_Functor.mapFlipped(Data_Maybe.functorMaybe)(lookup(k)(m))(
      function (a) {
        return new Data_Tuple.Tuple(a, $$delete(k)(m));
      }
    );
  };
};
var alter = function (f) {
  return function (k) {
    return function (m) {
      var $36 = f(lookup(k)(m));
      if ($36 instanceof Data_Maybe.Nothing) {
        return $$delete(k)(m);
      }
      if ($36 instanceof Data_Maybe.Just) {
        return insert(k)($36.value0)(m);
      }
      throw new Error(
        "Failed pattern match at Data.StrMap line 185, column 15 - line 187, column 25: " +
          [$36.constructor.name]
      );
    };
  };
};
var update = function (f) {
  return function (k) {
    return function (m) {
      return alter(Data_Maybe.maybe(Data_Maybe.Nothing.value)(f))(k)(m);
    };
  };
};
module.exports = {
  alter: alter,
  delete: $$delete,
  fold: fold,
  foldM: foldM,
  foldMap: foldMap,
  foldMaybe: foldMaybe,
  freezeST: freezeST,
  fromFoldable: fromFoldable,
  fromFoldableWith: fromFoldableWith,
  fromList: fromList,
  fromListWith: fromListWith,
  insert: insert,
  isEmpty: isEmpty,
  isSubmap: isSubmap,
  lookup: lookup,
  member: member,
  pop: pop,
  pureST: pureST,
  singleton: singleton,
  thawST: thawST,
  toList: toList,
  union: union,
  unions: unions,
  update: update,
  values: values,
  functorStrMap: functorStrMap,
  foldableStrMap: foldableStrMap,
  traversableStrMap: traversableStrMap,
  eqStrMap: eqStrMap,
  showStrMap: showStrMap,
  semigroupStrMap: semigroupStrMap,
  monoidStrMap: monoidStrMap,
  all: $foreign.all,
  empty: $foreign.empty,
  keys: $foreign.keys,
  runST: $foreign.runST,
  size: $foreign.size,
};
