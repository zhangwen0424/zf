import { forEachValue } from "./utils";
import { storeKey } from "./injectKey";

export default class Store {
  constructor(options) {
    // {state,actions,mutations,getter,modules}
    const store = this;

    // 组装 modules 数据
    store._modules = new ModuleCollection(options);

    // 定义状态，把状态定义到 store.state.aCount.cCount.count;
    const state = store._modules.root.state; // 根状态
    installModule(store, state, [], store._modules.root);
  }
  // createApp().use(store,'my')
  install(app, injectKey) {
    // 全局暴露一个变量 暴露的是store的实例
    app.provide(injectKey || storeKey, this); // 给根app增加一个_provides ,子组件会去向上查找
    // Vue.prototype.$store = this
    app.config.globalProperties.$store = this; // 增添$store属性
  }
}

// 递归安装
function installModule(store, rootState, path, module) {
  let isRoot = !path.length; // 如果数组是空数组 说明是根，否则不是

  if (!isRoot) {
    //[]
    let parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState);
    parentState[path[path.length - 1]] = module.state;
  }
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  });
}

class Module {
  constructor(rawModule) {
    this._raw = rawModule;
    this._children = {};
    this.state = rawModule.state;
  }
  // 写成 class的形式，方便扩展
  addChild(key, module) {
    this._children[key] = module;
  }
  getChild(key) {
    return this._children[key];
  }
  forEachChild(fn) {
    forEachValue(this._children, fn);
  }
}

class ModuleCollection {
  constructor(rootModule) {
    this.root = null;
    this.register(rootModule, []); // // root => a b  a=>c
  }
  register(rawModule, path) {
    const newModule = new Module(rawModule);
    if (path.length == 0) {
      // 是一个根模块
      this.root = newModule;
    } else {
      // [a]  [b]   [a]
      // 这里是循环去拿路径中的模块，把模块放到对应的children下
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    // 如果 modules 存在，循环 modules中的模块到children 中
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(rawChildModule, path.concat(key));
      });
    }
  }
}

// 格式化用户的参数，实现根据自己的需要，后续使用时方便
// root = {
//     _raw:rootModule,
//     state:rootModule.state, // 用户管理
//     _children:{
//         aCount:{ // > 1
//             _raw:aModule,
//             state:aModule.state,
//             _children:{ // > 1
//                 cCount:{
//                     _raw:useCssModule,
//                     state:cModule.state,
//                     _children:{}
//                 }
//             }
//         },
//         bCount:{
//             _raw:bModule,
//             state:bModule.state,
//             _children:{}
//         }
//     }
// }
