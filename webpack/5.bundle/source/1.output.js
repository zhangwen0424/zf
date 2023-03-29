//模块定义
//key是模块ID，也就是模块相对于相前根目录的相对路径
var modules = {
  "./src/title.js": (module) => {
    module.exports = "title";
  },
};

function require(moduleId) {
  var module = {
    exports: {},
  };
  modules[moduleId](module, module.exports, require);
  return module.export;
}

let title = require("./src/title.js");
console.log("title");
