// Generated by psc version 0.9.3
"use strict";
var $foreign = require("./foreign");
var Prelude = require("../Prelude");
var Data_Either = require("../Data.Either");
var Data_Maybe = require("../Data.Maybe");
var Data_String = require("../Data.String");
var Data_Show = require("../Data.Show");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Function = require("../Data.Function");
var showRegex = new Data_Show.Show($foreign["showRegex'"]);
var search = $foreign._search(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var renderFlags = function (f) {
  return (
    (function () {
      if (f.global) {
        return "g";
      }
      if (!f.global) {
        return "";
      }
      throw new Error(
        "Failed pattern match at Data.String.Regex line 72, column 4 - line 72, column 32: " +
          [f.global.constructor.name]
      );
    })() +
    ((function () {
      if (f.ignoreCase) {
        return "i";
      }
      if (!f.ignoreCase) {
        return "";
      }
      throw new Error(
        "Failed pattern match at Data.String.Regex line 73, column 4 - line 73, column 36: " +
          [f.ignoreCase.constructor.name]
      );
    })() +
      ((function () {
        if (f.multiline) {
          return "m";
        }
        if (!f.multiline) {
          return "";
        }
        throw new Error(
          "Failed pattern match at Data.String.Regex line 74, column 4 - line 74, column 35: " +
            [f.multiline.constructor.name]
        );
      })() +
        ((function () {
          if (f.sticky) {
            return "y";
          }
          if (!f.sticky) {
            return "";
          }
          throw new Error(
            "Failed pattern match at Data.String.Regex line 75, column 4 - line 75, column 32: " +
              [f.sticky.constructor.name]
          );
        })() +
          (function () {
            if (f.unicode) {
              return "u";
            }
            if (!f.unicode) {
              return "";
            }
            throw new Error(
              "Failed pattern match at Data.String.Regex line 76, column 4 - line 76, column 33: " +
                [f.unicode.constructor.name]
            );
          })())))
  );
};
var regex = function (s) {
  return function (f) {
    return Data_Function.apply(
      $foreign["regex'"](Data_Either.Left.create)(Data_Either.Right.create)(s)
    )(renderFlags(f));
  };
};
var parseFlags = function (s) {
  return {
    global: Data_String.contains("g")(s),
    ignoreCase: Data_String.contains("i")(s),
    multiline: Data_String.contains("m")(s),
    sticky: Data_String.contains("y")(s),
    unicode: Data_String.contains("u")(s),
  };
};
var noFlags = {
  global: false,
  ignoreCase: false,
  multiline: false,
  sticky: false,
  unicode: false,
};
var match = $foreign._match(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
module.exports = {
  match: match,
  noFlags: noFlags,
  parseFlags: parseFlags,
  regex: regex,
  renderFlags: renderFlags,
  search: search,
  showRegex: showRegex,
  flags: $foreign.flags,
  replace: $foreign.replace,
  "replace'": $foreign["replace'"],
  source: $foreign.source,
  split: $foreign.split,
  test: $foreign.test,
};
