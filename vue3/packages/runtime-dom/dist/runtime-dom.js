var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(element) {
    return document.createElement(element);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  insert(element, container, anchor = null) {
    container.insertBefore(element, anchor);
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelector(selector);
  },
  setElementText(element, text) {
    element.textContent = text;
  },
  setText(textNode, text) {
    textNode.nodeValue = text;
  },
  createComment: (text) => document.createComment(text),
  nextSibling: (node) => node.nextSibling,
  parentNode: (node) => node.parentNode
};

// packages/runtime-dom/src/modules/attr.ts
function patchAttr(el, key, nextVal) {
  if (nextVal) {
    el.setAttribute(key, nextVal);
  } else {
    el.removeAttribute(key);
  }
}

// packages/runtime-dom/src/modules/class.ts
function patchClass(el, nextVal) {
  if (nextVal == null) {
    el.removeAttribute("class");
  } else {
    el.className = nextVal;
  }
}

// packages/runtime-dom/src/modules/event.ts
function createInvoker(nextVal) {
  const fn = (e) => fn.value(e);
  fn.value = nextVal;
  return fn;
}
function patchEvent(el, rawName, nextVal) {
  const invokers = el._vei || (el._vei = {});
  let eventName = rawName.slice(2).toLowerCase();
  const exisitingInvoker = invokers[eventName];
  if (nextVal && exisitingInvoker) {
    exisitingInvoker.value = nextVal;
  } else {
    if (nextVal) {
      const invoker = invokers[eventName] = createInvoker(nextVal);
      el.addEventListener(eventName, invoker);
    } else if (exisitingInvoker) {
      el.removeEventListener(eventName, exisitingInvoker);
      invokers[eventName] = null;
    }
  }
}

// packages/runtime-dom/src/modules/style.ts
function patchStyle(el, prevVal, nextVal) {
  const style = el.style;
  if (nextVal) {
    for (let key in nextVal) {
      style[key] = nextVal[key];
    }
  }
  if (prevVal) {
    for (let key in prevVal) {
      if (nextVal[key] == null) {
        style[key] = null;
      }
    }
  }
}

// packages/runtime-dom/src/patchProp.ts
function patchProp(el, key, prevVal, nextVal) {
  if (key == "class") {
    patchClass(el, nextVal);
  } else if (key == "style") {
    patchStyle(el, prevVal, nextVal);
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextVal);
  } else {
    patchAttr(el, key, nextVal);
  }
}

// packages/shared/src/index.ts
var isObject = function(value) {
  return value != null && typeof value === "object";
};
var isFunction = function(value) {
  return typeof value === "function";
};
var isString = function(value) {
  return typeof value === "string";
};
var invokeArrayFn = function(fns) {
  fns && fns.forEach((fn) => fn());
};
function ensureArray(val) {
  return Array.isArray(val) ? val : [val];
}

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
    trackEffects(dep);
  }
};
function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack && activeEffect) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
var trigger = function(target, key, newValue, oldValue) {
  const desMap = targetMap.get(target);
  if (!desMap)
    return;
  const dep = desMap.get(key);
  triggerEffects(dep);
};
function triggerEffects(dep) {
  if (dep) {
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
  }
}
function cleanupEffect(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}

// packages/reactivity/src/ref.ts
function isRef(value) {
  return !!(value && value.__v_isRef);
}
function ref(value) {
  return new RefImp(value);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
var RefImp = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dep = /* @__PURE__ */ new Set();
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    trackEffects(this.dep);
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this.rawValue) {
      this.rawValue = newVal;
      this._value = toReactive(newVal);
      triggerEffects(this.dep);
    }
  }
};
var ObjectRefImpl = class {
  constructor(_object, _key) {
    this._object = _object;
    this._key = _key;
    this.__v_isRef = true;
  }
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
};
function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
function toRefs(object) {
  let ret = Array.isArray(object) ? new Array(object.length) : /* @__PURE__ */ Object.create(null);
  for (let key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      let v = Reflect.get(target, key, receiver);
      return isRef(v) ? v.value : v;
    },
    set(target, key, value, receiver) {
      let oldValue = Reflect.get(target, key, receiver);
      if (isRef(oldValue)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  });
}

// packages/reactivity/src/handler.ts
var mutableHandle = {
  get(target, key, receiver) {
    if (key == "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    if (isRef(target[key])) {
      return target[key].value;
    }
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    return res;
  },
  set(target, key, newValue, receiver) {
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
    setter = getterOrOptions.set;
  }
  return new computedRefImple(getter, setter);
}
var computedRefImple = class {
  constructor(getter, setter) {
    this.setter = setter;
    this._dirty = true;
    this.dep = /* @__PURE__ */ new Set();
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
      triggerEffects(this.dep);
    });
  }
  get value() {
    trackEffects(this.dep);
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

// packages/runtime-core/src/component.ts
var curretInstance = null;
function setCurrentInstance(instance) {
  curretInstance = instance;
}
function getCurrentInstance() {
  return curretInstance;
}
function createComponentInstance(n2, parent) {
  const instance = {
    state: {},
    isMounted: false,
    subTree: null,
    vnode: n2,
    update: null,
    attrs: {},
    props: {},
    propsOptions: n2.type.props || {},
    proxy: null,
    render: null,
    setupState: {},
    exposed: {},
    slots: {},
    parent,
    ctx: {},
    provides: parent ? parent.provides : /* @__PURE__ */ Object.create(null)
  };
  return instance;
}
function setupComponent(instance) {
  const { props, type, children } = instance.vnode;
  instance.vnode.component = instance;
  initProps(instance, props);
  initSlots(instance, children);
  instance.proxy = new Proxy(instance, {
    get(target, key, receiver) {
      const { state, props: props2, setupState } = target;
      if (key in setupState) {
        return setupState[key];
      }
      if (state && key in state) {
        return state[key];
      } else if (key in props2) {
        return props2[key];
      }
      let getter = publicProperties[key];
      if (getter) {
        return getter(instance);
      }
    },
    set(target, key, value, receiver) {
      const { state, props: props2, setupState } = target;
      if (key in setupState) {
        setupState[key] = value;
        return true;
      } else if (state && key in state) {
        state[key] = value;
        return true;
      } else if (key in props2) {
        console.warn("\u4E0D\u5141\u8BB8\u4FEE\u6539props");
        return true;
      }
      return true;
    }
  });
  let { data, render: render2, setup } = type;
  if (setup) {
    const context = {
      attrs: instance.attrs,
      emit(eventName, ...args) {
        let bindName = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`;
        const handler = instance.attrs[bindName];
        if (handler) {
          let handlers = Array.isArray(handler) ? handler : [handler];
          handlers.forEach((handler2) => handler2(...args));
        }
      },
      expose(exposed) {
        instance.exposed = exposed;
      },
      slots: instance.slots
    };
    setCurrentInstance(instance);
    const setupResult = setup(instance.props, context);
    setCurrentInstance(null);
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else {
      instance.setupState = proxyRefs(setupResult);
    }
  }
  if (isFunction(data)) {
    instance.state = reactive(data.call(instance.proxy));
  }
  if (!instance.render) {
    instance.render = render2;
  }
}
var publicProperties = {
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots
};
var initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
    instance.slots = children;
  }
};
var initProps = (instance, userProps) => {
  const attrs = {};
  const props = {};
  const options = instance.propsOptions || {};
  if (userProps) {
    for (let key in userProps) {
      const value = userProps[key];
      if (key in options) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  if (instance.vnode.shapeFlag & 2 /* FUNCTIONAL_COMPONENT */) {
    instance.props = attrs;
  } else {
    instance.attrs = attrs;
    instance.props = reactive(props);
  }
};

// packages/runtime-core/src/apiLifecycle.ts
var LicycleHooks = /* @__PURE__ */ ((LicycleHooks2) => {
  LicycleHooks2["BEFORE_MOUNT"] = "bm";
  LicycleHooks2["MOUNTED"] = "m";
  LicycleHooks2["BFORE_UPDATE"] = "bu";
  LicycleHooks2["UPDATED"] = "u";
  LicycleHooks2["BEFORE_UNMOUNT"] = "bum";
  LicycleHooks2["UNMOUNTED"] = "um";
  return LicycleHooks2;
})(LicycleHooks || {});
function createHook(type) {
  return (hook, i = curretInstance) => {
    if (curretInstance) {
      const hooks = curretInstance[type] || (curretInstance[type] = []);
      hooks.push(() => {
        setCurrentInstance(i);
        hook();
        setCurrentInstance(null);
      });
    }
  };
}
var onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
var onMounted = createHook("m" /* MOUNTED */);
var onBeforeUpdate = createHook("bu" /* BFORE_UPDATE */);
var onUpdated = createHook("u" /* UPDATED */);
var onBeforeUnmount = createHook("bum" /* BEFORE_UNMOUNT */);
var onUnmounted = createHook("um" /* UNMOUNTED */);

// packages/runtime-core/src/keepAlive.ts
var isKeepAlive = (vnode) => vnode.type.__v_isKeepAlive;
var KeepAlive = {
  __v_isKeepAlive: true,
  props: {
    max: Number
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    let { move, createElement, unmount } = instance.ctx.renderer;
    let storageContainer = createElement("div");
    instance.ctx.deactivated = (vnode) => {
      move(vnode, storageContainer);
    };
    instance.ctx.activated = (vnode, container, anchor) => {
      move(vnode, container, anchor);
    };
    const keys = /* @__PURE__ */ new Set();
    const cache = /* @__PURE__ */ new Map();
    const max = props.max;
    let comp;
    let cachekey;
    function cacheNode() {
      cache.set(cachekey, comp);
    }
    onMounted(cacheNode);
    onUpdated(cacheNode);
    function pruneCache(key) {
      let cacheVnode = cache.get(key);
      keys.delete(key);
      cache.delete(key);
      if (cacheVnode) {
        let shapeFlag = cacheVnode.shapeFlag;
        if (shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
          shapeFlag -= 512 /* COMPONENT_KEPT_ALIVE */;
        }
        if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
          shapeFlag -= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
        }
        cacheVnode.shapeFlag = shapeFlag;
        unmount(cacheVnode, storageContainer);
      }
    }
    return () => {
      let vnode = slots.default();
      const key = vnode.key == null ? vnode.type : vnode.key;
      const cacheVnode = cache.get(key);
      if (cacheVnode) {
        vnode.component = cacheVnode.component;
        vnode.shapeFlag |= 512 /* COMPONENT_KEPT_ALIVE */;
        keys.delete(key);
        keys.add(key);
      } else {
        cachekey = key;
        comp = vnode;
        keys.add(key);
        if (max && keys.size > max) {
          pruneCache(keys.values().next().value);
        }
      }
      vnode.shapeFlag = vnode.shapeFlag | 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
      return vnode;
    };
  }
};

// packages/runtime-core/src/Teleport.ts
var Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { mountChildren, patchChildren, move } = internals;
    if (!n1) {
      let target = n2.target = document.querySelector(n2.props.to);
      if (target) {
        n2.children = ensureArray(n2.children);
        mountChildren(n2.children, target);
      }
    } else {
      n1.children = ensureArray(n1.children);
      n2.children = ensureArray(n2.children);
      patchChildren(n1, n2);
      if (n2.props.to !== n1.props.to) {
        let target = n2.target = document.querySelector(n2.props.to);
        n2.children.forEach((child) => move(child, target));
      }
    }
  },
  remove(vnode) {
    vnode.target.innerHTML = "";
  }
};
var isTeleport = (val) => {
  return !!val.__isTeleport;
};

// packages/runtime-core/src/createVNode.ts
var Text = Symbol();
var Fragment = Symbol();
function isVNode(value) {
  return !!value.__v_isVNode;
}
function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
var currentBlock = null;
function openBlock() {
  currentBlock = [];
}
function createElementBlock(type, props, children, patchFlag) {
  const vnode = createVNode(type, props, children, patchFlag);
  vnode.dynamicChildren = currentBlock;
  currentBlock = null;
  return vnode;
}
function toDisplayString(val) {
  if (isObject(val)) {
    return JSON.stringify(val);
  }
  if (isString(val)) {
    return val;
  }
  if (val == null) {
    return "";
  }
  return String(val);
}
function createVNode(type, props, children = null, patchFlag = 0) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? isTeleport(type) ? 64 /* TELEPORT */ : 4 /* STATEFUL_COMPONENT */ : isFunction(type) ? 2 /* FUNCTIONAL_COMPONENT */ : 0;
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    key: props == null ? void 0 : props.key,
    el: null,
    shapeFlag,
    patchFlag,
    dynamicChildren: null
  };
  if (children) {
    let type2 = 0;
    if (Array.isArray(children)) {
      type2 = 16 /* ARRAY_CHILDREN */;
    } else if (isObject(children)) {
      type2 = 32 /* SLOTS_CHILDREN */;
    } else {
      vnode.children = String(children);
      type2 = 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlag |= type2;
    if (currentBlock && patchFlag > 0) {
      currentBlock.push(vnode);
    }
  }
  return vnode;
}

// packages/runtime-core/src/scheduler.ts
var queue = [];
var isFlushing = false;
var p = Promise.resolve();
function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    p.then(() => {
      isFlushing = false;
      let copyQueue = queue.slice(0);
      queue.length = 0;
      copyQueue.forEach((job2) => {
        job2();
      });
      copyQueue.length = 0;
    });
  }
}

// packages/runtime-core/src/seq.ts
function getSeq(arr) {
  const result = [0];
  const len = arr.length;
  let start, end, middle;
  const p2 = arr.slice(0).fill(-1);
  for (let i2 = 0; i2 < len; i2++) {
    const arrI = arr[i2];
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i2);
        p2[i2] = resultLastIndex;
        continue;
      }
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = (start + end) / 2 | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      p2[i2] = result[start - 1];
      result[start] = i2;
    }
  }
  let i = result.length;
  let last = result[i - 1];
  while (i-- > 0) {
    result[i] = last;
    last = p2[last];
  }
  return result;
}

// packages/runtime-core/src/renderer.ts
function createRenderer(renderOptions2) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    setElementText: hostSetElementText,
    setText: hostSetText,
    insert: hostInsert,
    createComment: hostCreateComment,
    nextSibling: hostNextSibling,
    parentNode: hostParentNode,
    patchProp: hostPatchProp
  } = renderOptions2;
  const render2 = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1, parentComponent);
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      default:
        if (shapeFlag & 1 /* ELEMENT */) {
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & 6 /* COMPONENT */) {
          processComponent(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & 64 /* TELEPORT */) {
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            move(vnode, el, anchor2) {
              hostInsert(
                vnode.component ? vnode.component.subTree.el : vnode.el,
                el,
                anchor2
              );
            }
          });
        }
    }
  };
  const processText = (n1, n2, el) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), el);
    } else {
      let el2 = n2.el = n1.el;
      if (n1.children === n2.children) {
        return;
      }
      hostSetText(el2, n2.children);
    }
  };
  const processFragment = (n1, n2, el, parentComponent = null) => {
    if (n1 == null) {
      mountChildren(n2.children, el, parentComponent, parentComponent);
    } else {
      patchKeyChildren(n1.children, n2.children, el, parentComponent);
    }
  };
  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent);
    } else {
      patchElement(n1, n2, parentComponent);
    }
  };
  const processComponent = (n1, n2, el, anchor, parentComponent) => {
    if (n1 == null) {
      if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
        parentComponent.ctx.activated(n2, el, anchor);
      } else {
        mountComponent(n2, el, anchor, parentComponent);
      }
    } else {
      updateComponent(n1, n2, el, anchor, parentComponent);
    }
  };
  const mountComponent = (n2, el, anchor, parentComponent) => {
    const instance = createComponentInstance(n2, parentComponent);
    if (isKeepAlive(n2)) {
      instance.ctx.renderer = {
        createElement: hostCreateElement,
        move(vnode, el2) {
          hostInsert(vnode.component.subTree.el, el2);
        },
        unmount
      };
    }
    setupComponent(instance);
    setupRendererEffect(instance, el, anchor);
  };
  function setupRendererEffect(instance, el, anchor) {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let { bm, m, vnode } = instance;
        invokeArrayFn(bm);
        let subTree;
        if (vnode.shapeFlag & 2 /* FUNCTIONAL_COMPONENT */) {
          subTree = vnode.type(instance.props, { slots: instance.slots });
        } else {
          subTree = instance.render.call(instance.proxy, instance.proxy);
        }
        patch(null, subTree, el, anchor, instance);
        instance.isMounted = true;
        instance.subTree = subTree;
        invokeArrayFn(m);
      } else {
        const prevSubTree = instance.subTree;
        const { next, bu, u, vnode } = instance;
        if (next) {
          updatePreRender(instance, next);
        }
        invokeArrayFn(bu);
        let nextSubTree;
        if (vnode.shapeFlag & 2 /* FUNCTIONAL_COMPONENT */) {
          nextSubTree = vnode.type(instance.props, { slots: instance.slots });
        } else {
          nextSubTree = instance.render.call(
            instance.proxy,
            instance.proxy
          );
        }
        instance.subTree = nextSubTree;
        patch(prevSubTree, nextSubTree, el, anchor, instance);
        invokeArrayFn(u);
      }
    };
    const effect2 = new ReactiveEffect(componentUpdateFn, () => {
      queueJob(instance.update);
    });
    const update = instance.update = effect2.run.bind(effect2);
    update();
  }
  const updatePreRender = (instance, next) => {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance, next.props);
    Object.assign(instance.slots, next.children);
  };
  function updateProps(instance, nextProps) {
    let prevProps = instance.props;
    for (let key in nextProps) {
      prevProps[key] = nextProps[key];
    }
    for (let key in prevProps) {
      if (!(key in nextProps)) {
        delete prevProps[key];
      }
    }
  }
  const updateComponent = (n1, n2, el, anchor, parentComponent) => {
    const instance = n2.component = n1.component;
    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2;
      instance.update();
    }
  };
  function shouldComponentUpdate(n1, n2) {
    const oldProps = n1.props;
    const newProps = n2.props;
    if (n1.childre || n2.children)
      return true;
    if (oldProps == newProps)
      return false;
    return hasChanged(oldProps, newProps);
  }
  const hasChanged = (oldProps = {}, newProps = {}) => {
    let oldKeys = Object.keys(oldProps);
    let newKeys = Object.keys(newProps);
    if (oldKeys.length != newKeys.length) {
      return true;
    }
    for (let i = 0; i < newKeys.length; i++) {
      const key = newKeys[i];
      if (newProps[key] !== oldProps[key]) {
        return true;
      }
    }
    return false;
  };
  const patchElement = (n1, n2, parentComponent = null) => {
    let el = n2.el = n1.el;
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    let { patchFlag } = n2;
    if (patchFlag) {
      if (patchFlag & 1 /* TEXT */) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else {
      patchProps(oldProps, newProps, el);
    }
    if (n2.dynamicChildren) {
      patchBlockChildren(n1, n2);
    } else {
      patchChildren(n1, n2, el, parentComponent);
    }
  };
  const patchProps = (oldProps, newProps, el) => {
    if (oldProps == newProps)
      return;
    for (let key in newProps) {
      let prevVal = oldProps[key];
      let nextVal = newProps[key];
      if (prevVal !== nextVal) {
        hostPatchProp(el, key, prevVal, nextVal);
      }
    }
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };
  const patchChildren = (n1, n2, el, parentComponent) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        unmountChildren(c1, parentComponent);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
          patchKeyChildren(c1, c2, el, parentComponent);
        } else {
          unmountChildren(c1, parentComponent);
        }
      } else {
        if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
          hostSetElementText(el, "");
        }
        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
          mountChildren(c2, el, null, parentComponent);
        }
      }
    }
  };
  const patchKeyChildren = (c1, c2, el, parentComponent) => {
    var _a, _b;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      while (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = (_a = c2[nextPos]) == null ? void 0 : _a.el;
        patch(null, c2[i], el, anchor);
        i++;
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent);
        i++;
      }
    }
    let s1 = i;
    let s2 = i;
    const keyToNewIndexMap = /* @__PURE__ */ new Map();
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndex = new Array(toBePatched).fill(0);
    for (let i2 = s2; i2 <= e2; i2++) {
      keyToNewIndexMap.set(c2[i2].key, i2);
    }
    for (let i2 = s1; i2 <= e1; i2++) {
      const vnode = c1[i2];
      let newIndex = keyToNewIndexMap.get(vnode.key);
      if (newIndex == void 0) {
        unmount(vnode, parentComponent);
      } else {
        newIndexToOldIndex[newIndex - s2] = i2 + 1;
        patch(vnode, c2[newIndex], el);
      }
    }
    const increasingNewIndexSequence = getSeq(newIndexToOldIndex);
    let j = increasingNewIndexSequence.length - 1;
    for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
      const curIndex = s2 + i2;
      const curNode = c2[curIndex];
      const anchor = (_b = c2[curIndex + 1]) == null ? void 0 : _b.el;
      if (newIndexToOldIndex[i2] == 0) {
        patch(null, curNode, el, anchor);
      } else {
        if (i2 == increasingNewIndexSequence[j]) {
          j--;
        } else {
          hostInsert(curNode.el, el, anchor);
        }
      }
    }
  };
  const patchBlockChildren = (n1, n2) => {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i]);
    }
  };
  const mountElement = (vnode, container, anchor = null, parentComponent) => {
    const { type, props, children, shapeFlag, transition } = vnode;
    const el = vnode.el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (children) {
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el, anchor, parentComponent);
      }
    }
    if (transition) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if (transition) {
      transition.enter(el);
    }
  };
  const mountChildren = (children, container, anchor, parentComponent) => {
    children.forEach((child) => {
      patch(null, child, container, anchor, parentComponent);
    });
  };
  const unmount = (vnode, parentComponent = null) => {
    const { shapeFlag, type, children } = vnode;
    if (type == Fragment) {
      return unmountChildren(children, parentComponent);
    }
    if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
      parentComponent.ctx.deactivated(vnode);
      return;
    }
    if (shapeFlag & 6 /* COMPONENT */) {
      let { subTree, bum, um } = vnode.component;
      bum && invokeArrayFn(bum);
      unmount(subTree, parentComponent);
      um && invokeArrayFn(um);
      return;
    }
    if (shapeFlag & 64 /* TELEPORT */) {
      return type.remove(vnode);
    }
    remove(vnode);
  };
  function remove(vnode) {
    const { el, transition } = vnode;
    const performRemove = () => {
      hostRemove(el);
    };
    if (transition) {
      transition.leave(el, performRemove);
    } else {
      performRemove();
    }
  }
  const unmountChildren = (children, parentComponent) => {
    children.forEach((child) => {
      unmount(child, parentComponent);
    });
  };
  return {
    render: render2
  };
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    }
    if (l == 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// packages/runtime-core/src/transition.ts
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
function resolveTransitionHooks(props) {
  const { onBeforeEnter, onLeave, onEnter } = props;
  return {
    beforeEnter: (el) => {
      onBeforeEnter(el);
    },
    enter(el, done) {
      onEnter(el, done);
    },
    leave(el, remove) {
      onLeave(el, remove);
    }
  };
}
function resolveTransitionProps(rawProps) {
  const {
    name = "v",
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`,
    onBeforeEnter,
    onEnter,
    onLeave
  } = rawProps;
  return {
    onBeforeEnter(el) {
      el.classList.add(enterFromClass);
      el.classList.add(enterActiveClass);
      onBeforeEnter && onBeforeEnter(el);
    },
    onEnter(el, done) {
      function resolve() {
        el.classList.remove(enterActiveClass);
        el.classList.remove(enterToClass);
        done && done();
      }
      nextFrame(() => {
        el.classList.remove(enterFromClass);
        el.classList.add(enterToClass);
        if (!onEnter || onEnter.length <= 1) {
          el.addEventListener("transitioned", resolve);
        }
      });
      onEnter && onEnter(el, resolve);
    },
    onLeave(el, done) {
      function resolve() {
        el.classList.remove(leaveToClass);
        el.classList.remove(leaveActiveClass);
        done && done();
      }
      el.classList.add(leaveFromClass);
      document.body.offsetHeight;
      el.classList.add(leaveActiveClass);
      nextFrame(() => {
        el.classList.remove(leaveFromClass);
        el.classList.remove(leaveToClass);
        if (!onLeave || onLeave.length < 1) {
          el.addEventListener("transitionend", resolve);
        }
      });
      onLeave && onLeave(el, resolve);
    }
  };
}
function Transition(props, { slots }) {
  return h(BaseTransition, resolveTransitionProps(props), slots);
}
var BaseTransition = {
  props: { onBeforeEnter: Function, onEnter: Function, onLeave: Function },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    return () => {
      const innerChild = slots.default && slots.default();
      const enterHooks = resolveTransitionHooks(props);
      innerChild.transition = enterHooks;
      let oldInnerChild = instance.subTree;
      if (oldInnerChild) {
        if (!isSameVnode(oldInnerChild, innerChild)) {
          const levaingHooks = resolveTransitionHooks(props);
          oldInnerChild.transition = levaingHooks;
        }
      }
      return innerChild;
    };
  }
};

// packages/runtime-core/src/defineAsyncComponent.ts
var defineAsyncComponent = (_a) => {
  var _b = _a, { loader } = _b, options = __objRest(_b, ["loader"]);
  return {
    setup() {
      const loaded = ref(false);
      const loading = ref(false);
      const error = ref(false);
      let attempts = ref(0);
      let errorTimer;
      if (options.timeout) {
        errorTimer = setTimeout(() => {
          error.value = true;
        }, options.timeout);
      }
      let timer;
      if (options.delay) {
        timer = setTimeout(() => {
          loading.value = true;
        }, options.delay || 200);
      } else {
        loading.value = true;
      }
      let InteralComp;
      function load() {
        return loader().catch((err) => {
          if (options.onError) {
            return new Promise((resolve, reject) => {
              const retry = () => {
                resolve(load());
              };
              const fail = () => {
                reject(err);
              };
              options.onError(err, retry, fail, ++attempts.value);
            });
          } else {
            throw err;
          }
        });
      }
      load().then((comp) => {
        loaded.value = true;
        error.value = false;
        InteralComp = comp;
      }).catch((err) => {
        error.value = true;
      }).finally(() => {
        loading.value = false;
      });
      return () => {
        if (error.value) {
          return h(options.errorComponent);
        } else if (loading.value) {
          return h(options.loadingComponent, { attempts });
        } else if (loaded.value) {
          return h(InteralComp);
        } else {
          return h(Fragment, []);
        }
      };
    }
  };
};

// packages/runtime-core/src/apiInject.ts
var provide = (key, value) => {
  const instance = getCurrentInstance();
  if (!instance)
    return;
  let parentPrvoides = instance.parent && instance.parent.provides;
  if (parentPrvoides === instance.provides) {
    instance.provides = Object.create(parentPrvoides);
  }
  instance.provides[key] = value;
};
var inject = (key, defaultVal) => {
  const instance = getCurrentInstance();
  if (!instance)
    return;
  const provides = instance.parent && instance.parent.provides;
  if (provides && key in provides) {
    return provides[key];
  } else {
    return defaultVal;
  }
};

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { patchProp });
function createRenderer2(renderOptions2) {
  return createRenderer(renderOptions2);
}
function render(vnode, container) {
  const renderer = createRenderer2(renderOptions);
  return renderer.render(vnode, container);
}
export {
  Fragment,
  KeepAlive,
  LicycleHooks,
  ReactiveEffect,
  ReactiveFlags,
  Teleport,
  Text,
  Transition,
  activeEffect,
  computed,
  createComponentInstance,
  createElementBlock,
  createVNode as createElementVNode,
  createRenderer2 as createRenderer,
  createVNode,
  currentBlock,
  curretInstance,
  defineAsyncComponent,
  dowatch,
  effect,
  getCurrentInstance,
  h,
  inject,
  isKeepAlive,
  isReactive,
  isRef,
  isSameVnode,
  isTeleport,
  isVNode,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  openBlock,
  provide,
  proxyRefs,
  reactive,
  ref,
  render,
  setCurrentInstance,
  setupComponent,
  toDisplayString,
  toReactive,
  toRef,
  toRefs,
  track,
  trackEffects,
  trigger,
  triggerEffects,
  watch,
  watchEffect
};
//# sourceMappingURL=runtime-dom.js.map
