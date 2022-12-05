import { isObject } from "@vue/shared";
export function reactive(value) {
  // reactive 只能处理对象类型的数据，不是对象不处理
  if (!isObject(value)) return value;

  const proxy = new Proxy(value, {
    get() {
      // 取值的时候
    },
    set(value: any) {
      // 设置值的时候
      return "";
    },
  });
  return proxy;
}
