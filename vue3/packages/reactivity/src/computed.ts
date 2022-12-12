import { isFunction } from "@vue/shared";
import { activeEffect, ReactiveEffect, trackEffects } from "./effect";

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

// 对象： 属性 ： effect
class computedRefImple {
  public effect;
  public _value;
  public _dirty = true; // 实现缓存效果
  public dep = new Set();
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {});
    // 当依赖的值发生变化了 也应该触发更新
  }
  get value() {
    // 在取值时 要对计算属性也做依赖收集
    // 如果计算属性是在 effect中使用的要做依赖收集
    trackEffects(this.dep);
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
