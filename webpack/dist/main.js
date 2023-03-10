/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/images/bgg.jpg?responsize":
/*!***************************************!*\
  !*** ./src/images/bgg.jpg?responsize ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("module.exports = {\n        srcSet: __webpack_require__.p + \"252f2c085489544a-300.jpg\"+\" 300w\"+\",\"+__webpack_require__.p + \"8e8b1629212b4ab3-600.jpg\"+\" 600w\"+\",\"+__webpack_require__.p + \"84386f65db3d835f-1024.jpg\"+\" 1024w\",\n        images: [{path: __webpack_require__.p + \"252f2c085489544a-300.jpg\",width: 300,height: 169},{path: __webpack_require__.p + \"8e8b1629212b4ab3-600.jpg\",width: 600,height: 338},{path: __webpack_require__.p + \"84386f65db3d835f-1024.jpg\",width: 1024,height: 576}],\n        src: __webpack_require__.p + \"84386f65db3d835f-1024.jpg\",\n        toString: function(){return __webpack_require__.p + \"84386f65db3d835f-1024.jpg\"},\n        \n        width: 1024,\n        height: 576\n      }\n\n//# sourceURL=webpack://webpack/./src/images/bgg.jpg?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _images_bgg_jpg_responsize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./images/bgg.jpg?responsize */ \"./src/images/bgg.jpg?responsize\");\n/* harmony import */ var _images_bgg_jpg_responsize__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_images_bgg_jpg_responsize__WEBPACK_IMPORTED_MODULE_0__);\n// import \"./css/index.css\";\n\n// let sum = (a, b) => a + b;\n// console.log(sum(1, 2));\n\n// import png from \"./images/icons/facebook.png\";\n// console.log(\"png:\", png);\n// import jpg from \"./images/avatar_M.jpg\";\n// console.log(\"jpg:\", jpg);\n// import txt from \"./test.txt\";\n// console.log(\"txt:\", txt);\n\n// 响应式图片，图片所能裁剪的最大尺寸是图片的尺寸，案例图片要找个大的\n// import responsiveImage from \"./images/bgg.jpg?sizes[]=300,sizes[]=600,sizes[]=1024\";\n\nconsole.log((_images_bgg_jpg_responsize__WEBPACK_IMPORTED_MODULE_0___default()));\nvar img = new Image();\nimg.srcset = (_images_bgg_jpg_responsize__WEBPACK_IMPORTED_MODULE_0___default().srcSet);\nimg.sizes = \"(min-width: 1024px) 1024px, 100vw\";\ndocument.body.appendChild(img);\nvar facebook = new Image();\nfacebook.src = __webpack_require__(/*! ./images/icons/facebook.png */ \"./src/images/icons/facebook.png\");\ndocument.body.appendChild(facebook);\nvar github = new Image();\ngithub.src = __webpack_require__(/*! ./images/icons/github.png */ \"./src/images/icons/github.png\");\ndocument.body.appendChild(github);\nvar twitter = new Image();\ntwitter.src = __webpack_require__(/*! ./images/icons/twitter.png */ \"./src/images/icons/twitter.png\");\ndocument.body.appendChild(twitter);\n\n//# sourceURL=webpack://webpack/./src/index.js?");

/***/ }),

/***/ "./src/images/icons/facebook.png":
/*!***************************************!*\
  !*** ./src/images/icons/facebook.png ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
eval("module.exports = __webpack_require__.p + \"cc97333c6f95cd9423c3.png\";\n\n//# sourceURL=webpack://webpack/./src/images/icons/facebook.png?");

/***/ }),

/***/ "./src/images/icons/github.png":
/*!*************************************!*\
  !*** ./src/images/icons/github.png ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
eval("module.exports = __webpack_require__.p + \"f11021803f68852df283.png\";\n\n//# sourceURL=webpack://webpack/./src/images/icons/github.png?");

/***/ }),

/***/ "./src/images/icons/twitter.png":
/*!**************************************!*\
  !*** ./src/images/icons/twitter.png ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
eval("module.exports = __webpack_require__.p + \"147dd4730a9d1090275d.png\";\n\n//# sourceURL=webpack://webpack/./src/images/icons/twitter.png?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;