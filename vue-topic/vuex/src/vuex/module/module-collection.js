import { forEachValue } from "../utils";
import { Module } from "./module";

// modules 类
export class ModuleCollection {
  constructor(rootModule) {
    this.root = null;
    this.register(rootModule, []); // root => a b  a=>c
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
  getNamespaced(path) {
    // 看改模块有没有命名空间，有的话把该模块路径拼进去
    let module = this.root;
    return path.reduce((namespaceStr, key) => {
      module = module.getChild(key); // 子模块
      return namespaceStr + (module.namespaced ? key + "/" : "");
    }, "");
  }
}
