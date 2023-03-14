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
