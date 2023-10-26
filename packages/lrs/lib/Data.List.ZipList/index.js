// Generated by psc version 0.9.3
"use strict";
var Prelude = require("../Prelude");
var Control_Alt = require("../Control.Alt");
var Control_Alternative = require("../Control.Alternative");
var Control_Plus = require("../Control.Plus");
var Data_Foldable = require("../Data.Foldable");
var Data_List_Lazy = require("../Data.List.Lazy");
var Data_Monoid = require("../Data.Monoid");
var Data_Traversable = require("../Data.Traversable");
var Partial_Unsafe = require("../Partial.Unsafe");
var Data_Show = require("../Data.Show");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Eq = require("../Data.Eq");
var Data_Ord = require("../Data.Ord");
var Data_Functor = require("../Data.Functor");
var Control_Apply = require("../Control.Apply");
var Data_Function = require("../Data.Function");
var Control_Applicative = require("../Control.Applicative");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Control_Bind = require("../Control.Bind");
var ZipList = function (x) {
  return x;
};
var showZipList = function (dictShow) {
  return new Data_Show.Show(function (v) {
    return (
      "(ZipList " + (Data_Show.show(Data_List_Lazy.showList(dictShow))(v) + ")")
    );
  });
};
var runZipList = function (v) {
  return v;
};
var semigroupZipList = new Data_Semigroup.Semigroup(function (z1) {
  return function (z2) {
    return Data_Semigroup.append(Data_List_Lazy.semigroupList)(runZipList(z1))(
      runZipList(z2)
    );
  };
});
var monoidZipList = new Data_Monoid.Monoid(function () {
  return semigroupZipList;
}, Data_Monoid.mempty(Data_List_Lazy.monoidList));
var functorZipList = new Data_Functor.Functor(function (f) {
  return function (v) {
    return Data_Functor.map(Data_List_Lazy.functorList)(f)(v);
  };
});
var foldableZipList = new Data_Foldable.Foldable(
  function (dictMonoid) {
    return function (f) {
      return function (v) {
        return Data_Foldable.foldMap(Data_List_Lazy.foldableList)(dictMonoid)(
          f
        )(v);
      };
    };
  },
  function (f) {
    return function (b) {
      return function (v) {
        return Data_Foldable.foldl(Data_List_Lazy.foldableList)(f)(b)(v);
      };
    };
  },
  function (f) {
    return function (b) {
      return function (v) {
        return Data_Foldable.foldr(Data_List_Lazy.foldableList)(f)(b)(v);
      };
    };
  }
);
var traversableZipList = new Data_Traversable.Traversable(
  function () {
    return foldableZipList;
  },
  function () {
    return functorZipList;
  },
  function (dictApplicative) {
    return function (v) {
      return Data_Functor.map(
        dictApplicative["__superclass_Control.Apply.Apply_0"]()[
          "__superclass_Data.Functor.Functor_0"
        ]()
      )(ZipList)(
        Data_Traversable.sequence(Data_List_Lazy.traversableList)(
          dictApplicative
        )(v)
      );
    };
  },
  function (dictApplicative) {
    return function (f) {
      return function (v) {
        return Data_Functor.map(
          dictApplicative["__superclass_Control.Apply.Apply_0"]()[
            "__superclass_Data.Functor.Functor_0"
          ]()
        )(ZipList)(
          Data_Traversable.traverse(Data_List_Lazy.traversableList)(
            dictApplicative
          )(f)(v)
        );
      };
    };
  }
);
var eqZipList = function (dictEq) {
  return new Data_Eq.Eq(function (z1) {
    return function (z2) {
      return Data_Eq.eq(Data_List_Lazy.eqList(dictEq))(runZipList(z1))(
        runZipList(z2)
      );
    };
  });
};
var ordZipList = function (dictOrd) {
  return new Data_Ord.Ord(
    function () {
      return eqZipList(dictOrd["__superclass_Data.Eq.Eq_0"]());
    },
    function (z1) {
      return function (z2) {
        return Data_Ord.compare(Data_List_Lazy.ordList(dictOrd))(
          runZipList(z1)
        )(runZipList(z2));
      };
    }
  );
};
var applyZipList = new Control_Apply.Apply(
  function () {
    return functorZipList;
  },
  function (v) {
    return function (v1) {
      return Data_List_Lazy.zipWith(Data_Function.apply)(v)(v1);
    };
  }
);
var zipListIsNotBind = function (dictFail) {
  return new Control_Bind.Bind(function () {
    return applyZipList;
  }, Partial_Unsafe.unsafeCrashWith("bind: unreachable"));
};
var applicativeZipList = new Control_Applicative.Applicative(
  function () {
    return applyZipList;
  },
  function ($34) {
    return ZipList(Data_List_Lazy.repeat($34));
  }
);
var altZipList = new Control_Alt.Alt(function () {
  return functorZipList;
}, Data_Semigroup.append(semigroupZipList));
var plusZipList = new Control_Plus.Plus(function () {
  return altZipList;
}, Data_Monoid.mempty(monoidZipList));
var alternativeZipList = new Control_Alternative.Alternative(
  function () {
    return applicativeZipList;
  },
  function () {
    return plusZipList;
  }
);
module.exports = {
  ZipList: ZipList,
  runZipList: runZipList,
  showZipList: showZipList,
  eqZipList: eqZipList,
  ordZipList: ordZipList,
  semigroupZipList: semigroupZipList,
  monoidZipList: monoidZipList,
  foldableZipList: foldableZipList,
  traversableZipList: traversableZipList,
  functorZipList: functorZipList,
  applyZipList: applyZipList,
  applicativeZipList: applicativeZipList,
  altZipList: altZipList,
  plusZipList: plusZipList,
  alternativeZipList: alternativeZipList,
  zipListIsNotBind: zipListIsNotBind,
};
