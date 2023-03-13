(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') module.exports = factory();else if (typeof define === 'function' && define.amd) define([], factory);else {
    var a = factory();
    for (var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
  }
})(self, () => {
  return (() => {
    "use strict";
    var __webpack_modules__ = {
      "./src/index.css": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        __webpack_require__.r(__webpack_exports__);
      },
      "jquery": module => {
        module.exports = require("jquery");
      },
      "lodash": module => {
        module.exports = require("lodash");
      }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
      var cachedModule = __webpack_module_cache__[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = __webpack_module_cache__[moduleId] = {
        exports: {}
      };
      __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
      return module.exports;
    }
    (() => {
      __webpack_require__.n = module => {
        var getter = module && module.__esModule ? () => module['default'] : () => module;
        __webpack_require__.d(getter, {
          a: getter
        });
        return getter;
      };
    })();
    (() => {
      __webpack_require__.d = (exports, definition) => {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, {
              enumerable: true,
              get: definition[key]
            });
          }
        }
      };
    })();
    (() => {
      __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      __webpack_require__.r = exports => {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
          });
        }
        Object.defineProperty(exports, '__esModule', {
          value: true
        });
      };
    })();
    var __webpack_exports__ = {};
    (() => {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        "add": () => add
      });
      var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("lodash");
      var lodash__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
      var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("jquery");
      var jquery__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
      var _index_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/index.css");
      const add = (a, b) => a + b;
      console.log("process.env.NODE_ENV ---- ", "development");
    })();
    return __webpack_exports__;
  })();
});