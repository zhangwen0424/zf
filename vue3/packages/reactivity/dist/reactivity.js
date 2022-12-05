// packages/shared/src/index.ts
var isObject = function(value) {
  return value != null && typeof value === "object";
};

// packages/reactivity/src/handler.ts
var mutableHandle = {
  get(target, key, receiver) {
    console.log("handler getter");
    if (key == "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("handler setter");
    return Reflect.set(target, key, value, receiver);
  }
};

// packages/reactivity/src/reactive.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target))
    return target;
  let existingProxy = reactiveMap.get(target);
  if (existingProxy)
    return existingProxy;
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const proxy = new Proxy(target, mutableHandle);
  reactiveMap.set(target, proxy);
  return proxy;
}

// packages/reactivity/src/effect.ts
var effect = function() {
};
export {
  ReactiveFlags,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
