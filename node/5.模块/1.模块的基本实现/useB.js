// 1) 内部采用了同步读取的方案 ，将文件内容获取到。 require方法是同步的。 底层用的是同步的读取 fs.readFileSync

// 简化的require方法
// function require(文件名){
//     // 根据文件名获取内容，包装函数，并且把获取到的结果放到module.exports
//     let module = {
//         exports:''
//     }
//     ;(function (module,exports){
//         module.exports = '结果'
//     })(module,module.exports)
//     return module.exports
// }

// 文件模块: 路径来引入的模块 自己写的模块，文件模块
// 内置模块:核心模块 fs 模块核心模块  path 模块
// 第三方模块：别人写好的安装的

// 源码先看广度，核心逻辑 （先看整体的流程，而不是冲着一个方法都看完）
// 掌握整体流程后，再去看感兴趣的方法或者功能
// 1.Module 每个文件都是一个模块，通过new Module的方式来创建 模块
// 2.我们调用的require方法Module.prototype.require方法
// 3.根基文件名来加载模块 Module._load
// 4.Module._resolveFilename 来根据用户传入的文件名来获取对应的名字。 添加后缀并且变成绝对路径
// 5.同一个模块加载多次应该只允许一次，所以内部做了缓存了Module._cache
// 6.如果是内置模块就加载内置模块
// 7.通过new Module创建模块的，exports 默认是空{}
// 8. module.load 就是根据文件名读取文件
// 如果这个文件后缀是.mjs 结尾的 不能使用require  只能使用import语法
// 9.根据后缀名解析 到对应的策略来执行代码
// 10.读取文件内容
// 11.给文件内容添加一个函数 module._compile
// 12.wrapSafe 给内容进行了包裹 （vm.compileFunction）
// 13.执行函数
// 最终返回的是 module.exports

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function Module(id) {
  this.exports = {}; // 模块最终的导出的结果都在这里面
  this.id = id;
}
Module._cache = {}; // 模块缓存
// 后缀处理
Module._extentions = {
  ".js": (module) => {
    const content = fs.readFileSync(module.id, "utf-8");
    // 如何将字符串包装成函数,
    // 1. 可以用new Function来直接实现，缺点：无法指定上下文，会跨作用域
    //    console.log(new Function('a','b','c',content).toString())
    // 2. eval 找的是上层作用域(环境污染问题，模块希望作用域是独立的) 可以直接将代码放到这个eval转成成js
    // 3. 支持沙箱 可以保证作用域不污染，可以指定函数中的this,手动指定上下文
    //    常见的沙箱：快照， 通过proxy来实现沙箱

    const wrapperFunction = vm.compileFunction(content, [
      // 数组中参数都是函数内部的，可以被访问
      "module",
      "exports",
      "require",
      "__dirname",
      "__filename",
    ]);
    let exports = module.exports;
    let require = req;
    let __dirname = path.dirname(module.id); // 文件对应的目录
    let _filename = module.id; // 绝对路径
    //  compileWrapper(module)
    Reflect.apply(wrapperFunction, exports, [
      module,
      exports,
      require,
      __dirname,
      __filename,
    ]);
  },
  ".json": (module) => {
    // json如何处理
    const content = fs.readFileSync(module.id, "utf-8");
    module.exports = JSON.parse(content);
  },
};

// 处理成需要的文件名
Module._resolveFilename = function (id) {
  // 默认会查找同名的文件，会尝试添加后缀
  const exts = Reflect.ownKeys(Module._extentions);
  let isExisits = fs.existsSync(id); // 不会抛错 fs.access 需要用tryCatch
  if (isExisits) return path.resolve(__dirname, id);
  // 先查找js在查找json
  for (let i = 0; i < exts.length; i++) {
    const fileUrl = path.resolve(__dirname, id) + exts[i];
    if (fs.existsSync(fileUrl)) {
      return fileUrl;
    }
  }
  throw new Error("模块找不到！");
};

Module.prototype.load = function () {
  // 根据文件的后缀采用不同的测略来执行
  const ext = path.extname(this.id); // a.min.js -> path.basename(当前路径):a.min  path.extname(扩展名):".js"
  // console.log(path.basename(this.id), path.extname(this.id));
  Module._extentions[ext](this); // 根据后缀名来处理对应的模块
};

// 模块引入
function req(id) {
  // 1.根据用户传递的id 来进行模块的加载，相对路径转换成绝对路径
  const absPath = Module._resolveFilename(id);
  // 2.创建模块缓存，多次引用时只取一次，可以解决循环引用问题
  let existsModule = Module._cache[absPath];
  if (existsModule) {
    return existsModule.exports; // 返回上一次导出的结果
  }
  // 根据文件创建一个模块.
  const module = new Module(absPath); // 如果我多次require模块这个模块只会被读取一次
  Module._cache[absPath] = module; // 缓存模块
  // 3.就是加载这个模块
  module.load(); // 内部会读取文件。。。
  return module.exports;
}

// const str = req("./b"); // .js 后缀 .json 后缀， 默认先找js文件
const str = req("./a");
console.log(str);
