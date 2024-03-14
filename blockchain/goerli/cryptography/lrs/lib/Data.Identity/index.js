// Generated by psc version 0.9.3
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra");
var Data_Bounded = require("../Data.Bounded");
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_Eq = require("../Data.Eq");
var Data_EuclideanRing = require("../Data.EuclideanRing");
var Data_Field = require("../Data.Field");
var Data_Foldable = require("../Data.Foldable");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Monoid = require("../Data.Monoid");
var Data_Ord = require("../Data.Ord");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Data_Traversable = require("../Data.Traversable");
var Identity = function (x) {
    return x;
};
var showIdentity = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Identity " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringIdentity = function (dictSemiring) {
    return new Data_Semiring.Semiring(function (v) {
        return function (v1) {
            return Data_Semiring.add(dictSemiring)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_Semiring.mul(dictSemiring)(v)(v1);
        };
    }, Data_Semiring.one(dictSemiring), Data_Semiring.zero(dictSemiring));
};
var semigroupIdenity = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semigroup.append(dictSemigroup)(v)(v1);
        };
    });
};
var runIdentity = function (v) {
    return v;
};
var ringIdentity = function (dictRing) {
    return new Data_Ring.Ring(function () {
        return semiringIdentity(dictRing["__superclass_Data.Semiring.Semiring_0"]());
    }, function (v) {
        return function (v1) {
            return Data_Ring.sub(dictRing)(v)(v1);
        };
    });
};
var monoidIdentity = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupIdenity(dictMonoid["__superclass_Data.Semigroup.Semigroup_0"]());
    }, Data_Monoid.mempty(dictMonoid));
};
var heytingAlgebraIdentity = function (dictHeytingAlgebra) {
    return new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    }, Data_HeytingAlgebra.ff(dictHeytingAlgebra), function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.implies(dictHeytingAlgebra)(v)(v1);
        };
    }, function (v) {
        return Data_HeytingAlgebra.not(dictHeytingAlgebra)(v);
    }, Data_HeytingAlgebra.tt(dictHeytingAlgebra));
};
var functorIdentity = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var invariantIdentity = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorIdentity));
var foldableIdentity = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var traversableIdentity = new Data_Traversable.Traversable(function () {
    return foldableIdentity;
}, function () {
    return functorIdentity;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative["__superclass_Control.Apply.Apply_0"]())["__superclass_Data.Functor.Functor_0"]())(Identity)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative["__superclass_Control.Apply.Apply_0"]())["__superclass_Data.Functor.Functor_0"]())(Identity)(f(v));
        };
    };
});
var extendIdentity = new Control_Extend.Extend(function () {
    return functorIdentity;
}, function (f) {
    return function (m) {
        return f(m);
    };
});
var eqIdentity = function (dictEq) {
    return new Data_Eq.Eq(function (v) {
        return function (v1) {
            return Data_Eq.eq(dictEq)(v)(v1);
        };
    });
};
var ordIdentity = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqIdentity(dictOrd["__superclass_Data.Eq.Eq_0"]());
    }, function (v) {
        return function (v1) {
            return Data_Ord.compare(dictOrd)(v)(v1);
        };
    });
};
var comonadIdentity = new Control_Comonad.Comonad(function () {
    return extendIdentity;
}, function (v) {
    return v;
});
var commutativeRingIdentity = function (dictCommutativeRing) {
    return new Data_CommutativeRing.CommutativeRing(function () {
        return ringIdentity(dictCommutativeRing["__superclass_Data.Ring.Ring_0"]());
    });
};
var euclideanRingIdentity = function (dictEuclideanRing) {
    return new Data_EuclideanRing.EuclideanRing(function () {
        return commutativeRingIdentity(dictEuclideanRing["__superclass_Data.CommutativeRing.CommutativeRing_0"]());
    }, function (v) {
        return Data_EuclideanRing.degree(dictEuclideanRing)(v);
    }, function (v) {
        return function (v1) {
            return Data_EuclideanRing.div(dictEuclideanRing)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_EuclideanRing.mod(dictEuclideanRing)(v)(v1);
        };
    });
};
var fieldIdentity = function (dictField) {
    return new Data_Field.Field(function () {
        return euclideanRingIdentity(dictField["__superclass_Data.EuclideanRing.EuclideanRing_0"]());
    });
};
var boundedIdentity = function (dictBounded) {
    return new Data_Bounded.Bounded(function () {
        return ordIdentity(dictBounded["__superclass_Data.Ord.Ord_0"]());
    }, Data_Bounded.bottom(dictBounded), Data_Bounded.top(dictBounded));
};
var booleanAlgebraIdentity = function (dictBooleanAlgebra) {
    return new Data_BooleanAlgebra.BooleanAlgebra(function () {
        return heytingAlgebraIdentity(dictBooleanAlgebra["__superclass_Data.HeytingAlgebra.HeytingAlgebra_0"]());
    });
};
var applyIdentity = new Control_Apply.Apply(function () {
    return functorIdentity;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindIdentity = new Control_Bind.Bind(function () {
    return applyIdentity;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeIdentity = new Control_Applicative.Applicative(function () {
    return applyIdentity;
}, Identity);
var monadIdentity = new Control_Monad.Monad(function () {
    return applicativeIdentity;
}, function () {
    return bindIdentity;
});
var altIdentity = new Control_Alt.Alt(function () {
    return functorIdentity;
}, function (x) {
    return function (v) {
        return x;
    };
});
module.exports = {
    Identity: Identity, 
    runIdentity: runIdentity, 
    eqIdentity: eqIdentity, 
    ordIdentity: ordIdentity, 
    boundedIdentity: boundedIdentity, 
    heytingAlgebraIdentity: heytingAlgebraIdentity, 
    booleanAlgebraIdentity: booleanAlgebraIdentity, 
    semigroupIdenity: semigroupIdenity, 
    monoidIdentity: monoidIdentity, 
    semiringIdentity: semiringIdentity, 
    euclideanRingIdentity: euclideanRingIdentity, 
    ringIdentity: ringIdentity, 
    commutativeRingIdentity: commutativeRingIdentity, 
    fieldIdentity: fieldIdentity, 
    showIdentity: showIdentity, 
    functorIdentity: functorIdentity, 
    invariantIdentity: invariantIdentity, 
    altIdentity: altIdentity, 
    applyIdentity: applyIdentity, 
    applicativeIdentity: applicativeIdentity, 
    bindIdentity: bindIdentity, 
    monadIdentity: monadIdentity, 
    extendIdentity: extendIdentity, 
    comonadIdentity: comonadIdentity, 
    foldableIdentity: foldableIdentity, 
    traversableIdentity: traversableIdentity
};