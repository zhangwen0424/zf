import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";

export function computed(getterOrOptions) {
  let getter, setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.log("warn");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.get;
  }
  // computedRefImpl 相当于把一个普通的值包装成一个对象，让他具备依赖收集的能力，属性改变触发依赖更新
  return new computedRefImple(getter, setter);
}

class computedRefImple {
  public effect;
  public _value;
  public _dirty = true; // 实现缓存效果
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {});
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newVal) {
    // this._value = newVal;
    this.setter(newVal);
  }
}
