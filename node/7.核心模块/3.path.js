const { resolve, join, dirname, extname, basename } = require("path");
// resolve 特点：返回绝对路径，但是如果你传递是一个相对路径，会根据用户执行的位置来转换成绝对路径 process.cwd()
console.log(resolve(__dirname, "./test.txt", "../")); // /Users/mornki/project/zf/node/7.核心模块
console.log(resolve("./test.txt")); // /Users/mornki/project/zf/test.txt
console.log(join(process.cwd(), "a", "b", "c", "../")); // 不会产生绝对路径 /Users/mornki/project/zf/a/b/

// 正常情况下 join和resolve能用不同的写法达到同样的目的，但是如果有/的情况，要拼接只能采用join方法，resolve 遇到/ 会返回根目录
console.log(dirname("a/b/c/")); // a/b
console.log(extname("a.js")); // .js
console.log(basename("a.js", "s")); // a.j

// path模块核心就是来处理路径的

// __dirname 是node中commonjs实现的时候 给函数添加的参数，在node环境下如果你要是使用了commonjs
