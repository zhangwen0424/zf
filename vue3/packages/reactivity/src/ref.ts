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

class ObjectRefImpl {
  // 将某个属性转成ref值
  public __v_isRef = true;
  constructor(private _object, private _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}
// 不丢失响应式 取 reactive 中的值
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  let ret = Array.isArray(object)
    ? new Array(object.length)
    : Object.create(null);
  for (let key in object) {
    // 将每一项全部转换成ref类型
    ret[key] = toRef(object, key);
  }
  return ret;
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      let v = Reflect.get(target, key, receiver);
      // debugger;
      return isRef(v) ? v.value : v;
    },
    set(target, key, value, receiver) {
      let oldValue = Reflect.get(target, key, receiver);
      // 如果是给ref复制 应该给他的.value赋值
      if (isRef(oldValue)) {
        oldValue.value = value;
        return true;
      } else {
        // 其它情况下直接赋值即可
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
