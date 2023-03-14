## 一.commonjs 规范

CommonJS 规范是 Node 中使用的模块化规范。定义了模块的导出和引入的方式，可以再多个文件之间共享 JavaScript
代码。

- 每个 js 文件都是一个模块
- 每个模块想去引用别人的模块，需要采用 require 语法 import
- 每个模块想被别人使用需要采用 module.exports 进行导出 export

### 1.模块的缓存

```js
Module._cache = {}; // 模块缓存
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
```

### 2.JSON 模块加载策略

```js
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
```

### 3.循环引用问题

commonjs 不会死循环，而是加载已经加载的部分结果，因为如果缓存中有，则使用缓存中的 exports 结果。初始化时默认会将当前模块也放入到缓存中。

那循环引用问题如何解决呢？

- 合理的模块划分，避免循环依赖
- 采用非强制依赖关系。

```js
// module-a.js
const b = require("./module-b");
console.log(b);
module.exports = "我是 a 模块";

// module-b.js
const a = require("./module-a");
console.log(a);
module.exports = "我是 b 模块";
```

```js
// module-a.js
let moduleB;
module.exports = {
  saveModule(mod) {
    moduleB = mod;
  },
  say() {
    console.log("a 中的 say");
  },
  init() {
    moduleB.say();
  },
};

// module-b.js
let moduleA;
module.exports = {
  saveModule(mod) {
    moduleA = mod;
  },
  say() {
    console.log("b 中的 say");
  },
  init() {
    moduleA.say();
  },
};
const a = require("./module-a");
const b = require("./module-b");
a.saveModule(b);
b.saveModule(a);
a.init(); // a 中使用了 b 中的 say
b.init(); // b 中使用了 a 中的 say
```

### 4.exports 和 module.exports 的区别

module.exports 和 exports 引用的是同一个内存地址，但是导入模块时最终采用的是 module.exports 结果。

```js
function require() {
  let exports = (module.exports = {});
  // 这里要注意，如果我们直接修改exports是无效的
  // exports = {}; // 无效
  // exports.xxx = {}; // 有效
  return module.exports;
}
```

同时我们还要注意 exports 和 module.exports 不能一起使用，否则使用 exports 导出的结果将会失效。

### 5.this 问题

Node 中的 this 指向的是 exports 对象，不是全局对象。目的是为了用户可以再 this 上挂载属性实现快速导出。

### 6.思考：

如果用户导出的是一个变量，后续变量被修改了，是否会影响导入的值

```js
// exportsA.js
let a = 0;
setInterval(() => {
  a++;
}, 1000);
module.exports = a; // 如果导出的是引用类型则会产生变化。

// useExportsA.js
setInterval(() => {
  let a = require("./exportsA");
  console.log(a); // require会缓存上次导入的结果。
}, 1000);

// let exports = module.exports = {}同一个东西
// this = exports
// exports = '值' 这种方式不会生效，最终返回的是module.exports
// return module.exports

// 导出的方式

// module.exports = {}  一下子都导出了
// this.x = xxx  一个个导出
// exports.xx = xxx
// module.exports.xx = xxx
// module.exports（默认导出）不能和exports连用
```

### 实现代码

```js
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
```

## 二.模块查找方式

// 模块分为三类：内置模块、第三方模块、文件模块
// npm 存放包的时候是拍平的方式，后安装的就把前面安装的给删掉

引用的模块路径是以 ./ 或 ../ 则为文件模块。没有路径则为核心模块或第三方模块

- 如果引入的模块是内置模块则直接返回。
- 如果是第三方模块，则会查找 node_modules 文件夹，先查找当前目录，没有则递归向上查找。找到 node_modules 下同名文件夹，加载 package.json 中对应的入口文件，没有入口则采用 index.js 文件
- 文件模块：如果模块名称对应的文件存在，则导入该文件。如果文件不存在，在看对应的文件夹是否存在，如果存在则查找该文件夹中的 package.json 中对应的入口文件或 index.js 文件。
- 如果没有找到模块，则报错。

## 三.npm 的使用

### 1.npm init

默认大家肯定比较熟悉了，直接 npm init -y 了事，这回我们再来仔细看看

```json
{
  "name": "my-pack",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {},
  "license": "ISC"
}
```

本地 npm 版本是 8.5.5，因为我的 node 版本是 v16.15.0

- name 是当前包的名字，也就是最终发布的 npm 官网上包的名字。不能和已有的包重名
- version 就是当前包的版本号，主要我们要探究如果优雅的管理版本号
- main 就是当前包的入口文件，也就是使用 require 默认引入的文件
- scripts 可以配置一些执行脚本
- license 协议许可

### 2.license

### 3.安装 install

#### 1）.全局安装

npm install http-server -g

全局安装的意思很简单，就是安装的模块会被安装到全局下，可以在命令行中直接使用安装的包。包会安装到/usr/local/lib 目录下，可以通过 npm config list 来进行查看。并且会在/usr/local/bin 目录下创造软链。

/usr/local/bin 是 mac 的系统目录，默认会被配置到环境变量中，此目录下的文件可以直接被访问。（通过 echo$PATH 打印所有环境变量）

**我们可以自己来尝试写一个全局包:**

- 创建 bin 目录并新增 www 文件。

```
#! /usr/bin/env node
console.log('my pack'); // #! 这句表示采用 node 来执
```

- 更新 package.json 文件

```
"bin": {
  "my-pack":"./bin/www" // 这里要注意名字和你建立的文件夹相同
},
```

- npm link

这样我们在命令行中直接输入 my-pack 就可以打印出，my pack

#### 2）.本地安装

npm install gulp --save-dev

本地安装就是在项目中使用，而非在命令行中使用！这里我们看到生成了一个 package-lock.json 文件，而且将安装的模块放到了 node_modules 下，而且 json 中也新增了些内容

```
"devDependencies": {
  "gulp": "^4.0.2"
}
```

--save-dev 代表当前依赖只在开发时被应用,如果默认不写相当于 --save 为项目依赖开发上线都需要。

也可以指定版本号来安装包: npm i jquery@2.2.0 # install 可以简写成

默认执行 npm i 会安装项目中所需要的依赖,如果只想安装生产环境依赖可以增加--production 参数

#### 3）.package-lock.json 文件

package-lock.json 文件用于锁定安装的 npm 包的版本，并且记录了它们的所有依赖关系。它保证了在不同的开
发环境中使用 npm 安装时，所安装的包版本是相同的。需要上传 git

```
"node_modules/array-unique": {
  "version": "0.3.2",
  "resolved":
  "https://registry.npmmirror.com/array-unique/-
  /array-unique-0.3.2.tgz",
  "integrity": "sha512-
  SleRWjh9JUud2wH1hPs9rZBZ33H6T9HOiL0uwGnGx9FpE6wK
  GyfWugmbkEOIs6qWrZhg0LWeLziLrEwQJhs5mQ==",
  "dev": true,
  "engines": {
  "node": ">=0.10.0"
  },
  ....
},
```

如果手动更新了 package.json 文件,执行安装命令会下载对应的新版本,并且会自动更新 lock 文件~

#### 4）.依赖方式

- dependencies 项目依赖
  可以使用 npm install -S 或 npm install --save 保存到依赖中，当发布到 npm 上时 dependencies 下的模块会作为依赖一起被下载!
- devDependencies 开发依赖
  可以使用 npm install -D 或 npm install --save-dev 保存到依赖中。 如果只是单纯的开发项目 dependencies、 devDependencies 只有提示的作用。
- peerDependencies 同版本依赖
  同等依赖，如果你安装我，那么你最好也安装我对应的依赖。
- optionalDependencies 可选依赖
  如果发现无法安装或无法找到，不会影响 npm 的安装
- bundledDependencies 捆绑依赖
  使用 npm pack 打包 tgz 时会将捆绑依赖一同打包

### 4.npm 版本管理

npm 采用了 semver 规范作为依赖版本管理方案。semver 约定一个包的版本号必须包含 3 个数字
MAJOR.MINOR.PATCH 意思是 主版本号.小版本号.修订版本号

- MAJOR 对应大的版本号迭代，做了不兼容旧版的修改时要更新 MAJOR 版本号
- MINOR 对应小版本迭代，发生兼容旧版 API 的修改或功能更新时，更新 MINOR 版本号
- PATCH 对应修订版本号，一般针对修复 BUG 的版本号
  当我们每次发布包的时候都需要升级版本号

```
  npm version major # 大版本号加 1，其余版本号归 0
  npm version minor # 小版本号加 1，修订号归 0
  npm version patch # 修订号加 1
```

预发版：

- alpha(α)：预览版，或者叫内部测试版；一般不向外部发布，会有很多 bug；一般只有测试人员使用。 "1.0.0-
  alpha.1"
- beta(β)：测试版，或者叫公开测试版；这个阶段的版本会一直加入新的功能；在 alpha 版之后推出。 "1.0.0-
- beta.1" - rc(release candidate)：最终测试版本；可能成为最终产品的候选版本，如果未出现问题则可发布成为正式版本。"1.0.0-rc.1"

range 含义 例

```
^2.2.1 指定的 MAJOR 版本号下, 所有更新的版本匹配 2.2.3, 2.3.0; 不匹配 1.0.3, 3.0.1
~2.2.1 指定 MAJOR.MINOR 版本号下，所有更新的版本 匹配 2.2.3, 2.2.9 ; 不匹配 2.3.0, 2.4.5

>=2.1 版本号大于或等于 2.1.0 匹配 2.1.2, 3.1
<=2.2 版本号小于或等于 2.2 匹配 1.0.0, 2.2.1, 2.2.11

1.0.0-2.0.0 版本号从 1.0.0 (含) 到 2.0.0 (含) 匹配 1.0.0, 1.3.4, 2.0.0
```

### 5.scripts 配置

在 package.json 中可以定义自己的脚本通过 npm run 来执行

```
"scripts": {
  "hello": "echo hello"
}
```

- npm run 命令执行时，会把 ./node_modules/.bin/ 目录添加到执行环境的 PATH 变量中，因此如果某个命令行包未全局安装，而只安装在了当前项目的 node_modules 中，通过 npm run 一样可以调用该命令。

- 执行 npm 脚本时要传入参数，需要在命令后加 -- 标明, 如 npm run hello -- --port 3000 可以将 --port 参数传 给 hello 命令
- npm 提供了 pre 和 post 两种钩子机制，可以定义某个脚本前后的执行脚本,没有定义默认会忽略

```
"scripts": {
  "prehello":"echo prehello",
  "hello": "echo hello",
  "posthello":"echo posthello"
}
```

### 6.npx 用法

npx 命令是 npm v5.2 之后引入的新命令，npx 可以帮我们直接执行 node_modules/.bin 文件夹下的文件

- 1).执行脚本 `npx mime`

- 2).避免安装全局模块`npx create-react-app react-project`
  我们可以直接使用 npx 来执行模块，它会先进行安装，安装执行后会将下载过的模块删除，这样可以一直使用最新版本

### 7.包的发布

包的发布比较简单，首先我们需要先切换到官方源,这里推荐个好用的工具 nrm

```
npm install nrm -g
nrm use npm # 切换到官方源
```

更新包名字，忽略文件夹可以使用 .npmignore，一切就绪后，发布！！！
`npm publish`

我们的包就可以成功的发布到 npm 上啦~

### 笔记

```
// 使用模块的时候 我们要安装

// 全局模块
// 全局模块 vite vue-cli cra 工具类的都是全局的。 最终只能在命令行中使用
// http-server 可以帮我们快速的启动一个本地服务
// npm install http-server -g
// npm config list

// 默认安装的模块 会在 /usr/local/bin下 创造一个软链(快捷方式)  安装的包在 /usr/local/lib/node_modules
// /usr/local/bin 这个目录可以执行的原因是因为 是系统目录 （环境变量中存在它，所有可以直接访问）
//  npm link 链接到全局下, 如果更改运行方式 需要重新link . link用于测试本地项目的

// 正规写完包之后，我们需要发布到npm上，之后通过npm install -g 的方式安装到电脑中
// 都只能用在命令行中

// 项目中依赖的模块 代码中使用的
// npm install 包名@版本号 --save-dev (开发webpack、gulp) / --save （生产+开发vue react）

// npm install --production 安装package.json中dependencies中的包

// peerDependencies (windows 下不会自动安装)   例如： 我有了房就要取媳妇
// optionDendencies (可选的)
// bundledDependencies 打包依赖 可以打指定打包的第三方模块

// 1) scripts脚本配置, 有的时候我们想运行固定的逻辑  npm run hello
// 2) 我们通过npm run 命令来运行一些包  (webpack 为了保证项目中用的版本都是一样的，我们会将webpack安装到项目中)
// npm start

// npx 这个是5.2 版本中提供的。 可以实现不安装就使用. 用完就删除
// 保证最新的， 可以运行已经存在的文件

// 如果使用npx 包存在则直接使用
// npx 不能像run一样记录一些代码 (npx测试方法)

// node 中的3n  npm nrm nvm  (npm install nrm -g)
// nrm ls 查看源
// nrm use npm 切换到官方源
// npm addUser  添加用户
// npm login 登录输入邮箱 密码 用户名
// npm publish 发布

// npm config list  查看当前 npm 包地址
// npm config set registry http://registry.npm.taobao.org/   切换回淘宝版本
// npm who am i 查看当前 npm 登陆用户

```
