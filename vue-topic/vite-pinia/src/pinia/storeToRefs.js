import { isReactive, toRaw, isRef, toRef } from "vue";

export function storeToRefs(store) {
  // store是 proxy，需要转成普通对象
  store = toRaw(store);

  const refs = {};
  for (let key in store) {
    const value = store[key];
    if (isRef(value) || isReactive(value)) {
      refs[key] = toRef(store, key);
    }
  }
  return refs;
}
