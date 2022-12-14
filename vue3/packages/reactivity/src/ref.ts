import { isObject } from "@vue/shared";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

// ref 处理的是基本类型
export function isRef(value) {
  return !!(value && value.__v_isRef);
}

export function ref(value) {
  return new RefImp(value);
}
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
class RefImp {
  public _value;
  public dep = new Set();
  public __v_isRef = true;
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackEffects(this.dep);
    return this._value;
  }
  set value(newVal) {
    // rawValue为原始值，_value为包装后的值
    if (newVal !== this.rawValue) {
      this.rawValue = newVal;
      this._value = toReactive(newVal);
      triggerEffects(this.dep);
    }
  }
}
