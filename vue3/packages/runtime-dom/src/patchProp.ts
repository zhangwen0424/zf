// 属性操作 api

import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export function patchProp(el, key, prevVal, nextVal) {
  // class 、 style 、 事件 、 普通属性 （表单属性 true-value）

  // 根据preVal 和 nextVal 做diff 来更新
  // {color:red}  {background:red}
  // {color:red}  null
  // null  {color:red}
  //  class="a b c"  class="b c"

  if (key == "class") {
    // 对类名的处理
    patchClass(el, nextVal);
  } else if (key == "style") {
    // 如何比较两个对象的差异呢？
    patchStyle(el, prevVal, nextVal);
  } else if (/^on[^a-z]/.test(key)) {
    // 事件：onClick、onMousedown
    // onClick ()=>{}， key:onClick, nextVal:()=>{}
    patchEvent(el, key, nextVal);
  } else {
    patchAttr(el, key, nextVal);
  }
}
