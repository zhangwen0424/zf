"use strict";
(self["webpackChunkwebpack"] = self["webpackChunkwebpack"] || []).push([["main"], {
  "./src/index.js": function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    var _vendor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/vendor.js");
    console.log(_vendor__WEBPACK_IMPORTED_MODULE_0__.vendor);
  },
  "./src/vendor.js": function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      "vendor": function () {
        return vendor;
      }
    });
    var vendor = "vendor";
  }
}, function (__webpack_require__) {
  var __webpack_exec__ = function (moduleId) {
    return __webpack_require__(__webpack_require__.s = moduleId);
  };
  var __webpack_exports__ = __webpack_exec__("./src/index.js");
}]);