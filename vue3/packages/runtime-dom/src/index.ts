// 用来耦合所有的 domapi

import { nodeOps } from "./nodeOps"; //节点操作
import { patchProp } from "./patchProp"; // 属性操作
const renderOptions = Object.assign(nodeOps, { patchProp }); // 渲染器属性
import { createRenderer as renderer } from "@vue/runtime-core";
// export function createRenderer(renderOptions) {}

// 用户自己创造渲染器，把属性传递进来
export function createRenderer(renderOptions) {
  // return {
  //   // 再次进行拆分，不关心 renderOptions，创建渲染器
  //   render(vnode, container) {
  //     console.log(vnode, container, renderOptions);
  //   },
  // };

  // 这里提供了渲染api，调用了底层的方法
  return renderer(renderOptions);
}
// 封装好的 render 方法
export function render(vnode, container) {
  // 内置渲染器，会自动传入domAPI 专门给vue来服务的
  const renderer = createRenderer(renderOptions);
  return renderer.render(vnode, container);
}

export * from "@vue/runtime-core";

// 再次进行拆分
// render 方法是基于平台的
