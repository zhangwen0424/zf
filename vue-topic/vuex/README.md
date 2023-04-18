# vuex

## 安装

- 1.安装 vue-cli 工具
  npm install -g @vue/cli
- 2.查看版本 5 以上
  vue --version
- 3.创建项目,选择第三项，自定义勾选 vuex
  vue create vuex
- 安装后代码报红： No Babel config file detected
  "parserOptions": {
  "requireConfigFile": false
  },

## 项目启动

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## 使用

vuex 原理就是 借助 provide 和 inject 实现组件间传递数据
createStore 注入数据，useStore 取数据，两者返回的是一个实例对象
