// packages/shared/src/index.ts
var isObject = function(value) {
  return value != null && typeof value === "object";
};
var isFunction = function(value) {
  return typeof value == "function";
};

// packages/reactivity/src/effect.ts
var effect = function(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
};
var activeEffect = void 0;
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.parent = void 0;
    this.deps = [];
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
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
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
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
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
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
    console.log("handler.js getter", key);
    if (key == "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    return res;
  },
  set(target, key, newValue, receiver) {
    console.log("handler.js setter", key);
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
function isReactive(value) {
  return value["__v_isReactive" /* IS_REACTIVE */];
}

// packages/reactivity/src/apiWatch.ts
function watch(source, cb, options = {}) {
  return dowatch(source, cb, options);
}
function watchEffect(source, options = {}) {
  return dowatch(source, null, options);
}
function dowatch(source, cb, options) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  let clear;
  let onCleanup = (fn) => {
    clear = fn;
  };
  const job = () => {
    if (cb) {
      if (clear)
        clear();
      const newVal = effect2.run();
      cb(newVal, oldVal, onCleanup);
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  oldVal = effect2.run();
}
function traverse(value, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(value)) {
    return value;
  }
  if (!seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}

// packages/reactivity/src/computed.ts
function computed(getterOrOptions) {
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
  return new computedRefImple(getter, setter);
}
var computedRefImple = class {
  constructor(getter, setter) {
    this.setter = setter;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
};
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  computed,
  dowatch,
  effect,
  isReactive,
  reactive,
  track,
  trigger,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
