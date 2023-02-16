import { isFunction, isObject, isString, ShapeFlags } from "@vue/shared";
import { isTeleport } from "vue";
export const Text = Symbol(); // 内置，文本类型
export const Fragment = Symbol(); // 包裹节点
export function isVNode(value) {
  return !!value.__v_isVNode; // 用来判断是否是虚拟节点
}
export function isSameVnode(n1, n2) {
  // 如果前后没key 都是undefiend ，认为key是一样的
  return n1.type === n2.type && n1.key === n2.key;
}

// 编译优化，靶向更新
// 模版编译后 ， vue内部做了优化，直接用我们之前的h方法是不具备优化的
// 如果拟采用的是jsx来编写vue代码是没有优化的，只有通过.vue 文件编写template 才能享受到这种优化。

export { createVNode as createElementVNode }; // 用于模版编译优化：靶向更新

export let currentBlock = null;

export function openBlock() {
  currentBlock = []; // 用来收集我们的动态节点
}

export function createElementBlock(type, props?, children?, patchFlag?) {
  // 需要根据用户提供的参数创建虚拟节点，并且在这个虚拟节点上增加一个dynamicChildren来收集
  const vnode = createVNode(type, props, children, patchFlag);
  vnode.dynamicChildren = currentBlock;
  currentBlock = null;
  return vnode;
}

// 转换成字符串
export function toDisplayString(val) {
  if (isObject(val)) {
    return JSON.stringify(val);
  }
  if (isString(val)) {
    return val;
  }
  if (val == null) {
    return "";
  }
  return String(val);
}

// type：节点类型，props:属性，children:儿子，只能是文本、数组、null， patchFlag = 0意味着没有编译优化
export function createVNode(type, props, children = null, patchFlag = 0) {
  // 虚拟节点需要有一些重要的属性
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type) // type 是对象说明是一个组件了
    ? isTeleport(type)
      ? ShapeFlags.TELEPORT
      : ShapeFlags.STATEFUL_COMPONENT
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT
    : 0;
  // 虚拟节点需要有一些重要的属性
  const vnode = {
    __v_isVNode: true, // 判断对象是不是虚拟节点可以采用这个字段
    type,
    props,
    children,
    key: props?.key, // 虚拟节点的key，主要用于diff算法
    el: null, // 虚拟节点对应的真实节点
    shapeFlag, //元素的形状，使用靠位运算，描述自己的类型和自己儿子的类型
    patchFlag, // 标记靶向节点
    dynamicChildren: null, //存储动态节点，用于编译优化：靶向更新
  };
  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      // 自己是元素，儿子是数组
      type = ShapeFlags.ARRAY_CHILDREN;
    } else if (isObject(children)) {
      // 组件的插槽
      type = ShapeFlags.SLOTS_CHILDREN;
    } else {
      vnode.children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    // |=  相当于把类型关联起来，类似于 +=
    vnode.shapeFlag |= type;

    // 当前block 应该收集子节点
    if (currentBlock && patchFlag > 0) {
      currentBlock.push(vnode);
    }
  }
  // 这里返回了虚拟节点，并且标识了虚拟节点的类型
  return vnode;
}

// 靠位运算  &  按位与都是1就是1  | 按位或 有一个是1就是1

/* 权限的组合可以采用 | 的方式
001  = 1  用户
010  = 2  管理员
100  = 4  超级管理员

人 -》 001 |  010  -> 011

// 判断是否包含某一权限使用 &
011 & 001  > 0 说明包含用户
011 & 010  > 0 说明包含管理员
011 & 100  = 0 不包含管理员
*/
