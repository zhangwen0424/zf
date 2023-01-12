import { NodeTypes } from "./ast";

export const TO_DISPLAY_STRING = Symbol("toDisplayString"); // 宏
export const CREATE_TEXT = Symbol("createTextVNode");
export const CREATE_ELEMENT_VNODE = Symbol("createElementVnode");
export const OPEN_BLOCK = Symbol("openBlock");
export const FRAGMENT = Symbol("fragment");
export const CREATE_ELEMENT_BLOCK = Symbol("createElementBlock");
export const helpNameMap = {
  [TO_DISPLAY_STRING]: "toDisplayString",
  [CREATE_TEXT]: "createTextVNode",
  [CREATE_ELEMENT_VNODE]: "createElementVNode",
  [CREATE_ELEMENT_BLOCK]: "createElementBlock",
  [OPEN_BLOCK]: "openBlock",
  [FRAGMENT]: "fragment",
};
// 枚举本质就是对象

// 生成文本调用的代码
export function createCallExpression(context, args) {
  // 模版：代码
  // 123 {{abc}} <div></div>
  // 转化为：
  // import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
  // export function render(_ctx, _cache, $props, $setup, $data, $options) {
  //   return (_openBlock(), _createElementBlock(_Fragment, null, [
  //     _createTextVNode("123 " + _toDisplayString(_ctx.abc) + " ", 1 /* TEXT */),
  //     _createElementVNode("div")
  //   ], 64 /* STABLE_FRAGMENT */))
  // }

  // _createTextVNode("123 " + _toDisplayString(_ctx.abc) + " ", 1 /* TEXT */),
  // arguments记录传入的参数，type 标识调用类型, helper 标识调用类型标识为js表达式，
  context.helper(CREATE_TEXT);
  return {
    type: NodeTypes.JS_CALL_EXPRESSION, //是 js 调用表达式 createTextVnode()
    arguments: args,
  };
}

// 生成虚拟节点调用的代码
export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.VNODE_CALL, // createElementVNode()
    tag,
    props,
    children,
  };
}

// 生成属性表达式调用的代码
export function createObjectExpression(properties) {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION, // 增加类型标识，对象表达式
    properties,
  };
}
