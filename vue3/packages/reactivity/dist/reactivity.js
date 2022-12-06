// packages/shared/src/index.ts
var isObject = function(value) {
  return value != null && typeof value === "object";
};

// packages/reactivity/src/effect.ts
var effect = function(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
};
var activeEffect = void 0;
var ReactiveEffect = class {
  constructor(fn) {
    this.fn = fn;
    this.parent = void 0;
    this.deps = [];
  }
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
};
var targetMap = /* @__PURE__ */ new WeakMap();
var track = function(target, key) {
  if (activeEffect) {
    let desMap = targetMap.get(target);
    if (!desMap) {
      targetMap.set(target, desMap = /* @__PURE__ */ new Map());
    }
    let dep = desMap.get(key);
    if (!dep) {
      desMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
};
var trigger = function(target, key, newValue, oldValue) {
  const desMap = targetMap.get(target);
  if (!desMap)
    return;
  const dep = desMap.get(key);
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect)
      effect2.run();
  });
};
function cleanupEffect(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.lenth = 0;
}

// packages/reactivity/src/handler.ts
var mutableHandle = {
  get(target, key, receiver) {
    console.log("handler getter", key);
    if (key == "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    return res;
  },
  set(target, key, newValue, receiver) {
    console.log("handler setter", key);
    let oldValue = target[key];
    const r = Reflect.set(target, key, newValue, receiver);
    if (oldValue !== newValue) {
      trigger(target, key, newValue, oldValue);
    }
    return r;
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
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  effect,
  reactive,
  track,
  trigger
};
//# sourceMappingURL=reactivity.js.map
