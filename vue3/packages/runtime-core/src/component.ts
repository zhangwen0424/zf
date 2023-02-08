import { proxyRefs, reactive } from "@vue/reactivity";
import { isFunction, ShapeFlags } from "@vue/shared";
export let curretInstance = null;

// 设置组件实例
export function setCurrentInstance(instance) {
  curretInstance = instance;
}

// 获取组件实例
export function getCurrentInstance() {
  return curretInstance;
}

// 创建实例
export function createComponentInstance(n2, parent) {
  // getCurrentInstance
  const instance = {
    state: {},
    isMounted: false, // 默认组件没有初始化，初始化后会将此属性isMounted true
    subTree: null, // 要渲染的子树的虚拟节点
    vnode: n2, // 组件的虚拟节点
    update: null, // 用户可以自己更新组件，向外暴露 update 方法
    attrs: {}, // 用户传递props - propsOptions, 自己无法消费的数据可以快速传递给其他组件
    props: {}, // propsOptions
    propsOptions: n2.type.props || {}, // 组件中接受的属性
    proxy: null, // 用于做代理
    render: null,
    setupState: {}, // setup 的状态
    exposed: {},
    slots: {}, // 存储当前组件提供的插槽
    parent,
    provides: parent ? parent.provides : Object.create(null), // 所有组件都有一个默认的provides属性
  }; // 用来记录组件的属性的，相关信息的
  return instance;
}

// 2 启动组件 给组件实例复制
export function setupComponent(instance) {
  // 组件的数据和渲染函数
  // const { data = () => ({}), render, props: propsOptions = {} } = n2.type; // 组件传入的 data,render

  const { props, type, children } = instance.vnode; // vnode = n2

  // 对于组件来说 组件保存的不是el，而是组件的实例, 复用组件的实例
  instance.vnode.component = instance;

  //  实例上props和attrs
  // n2.props 是组件的虚拟节点的props
  // n2.type.props 指的是 vuecomponent 中传的options中的 props
  initProps(instance, props); // 用用户传递给虚拟节点的props
  // 初始化插槽
  initSlots(instance, children);

  // 代理取值
  instance.proxy = new Proxy(instance, {
    get(target, key, receiver) {
      const { state, props, setupState } = target;

      // setupState的优先级高，优先从 setup中取值
      if (key in setupState) {
        return setupState[key];
      }

      // 从 state 中取值或者从 props 中取值，vue 中取值在 data 中 的还是 props 中的方便取值
      if (state && key in state) {
        return state[key];
      } else if (key in props) {
        return props[key];
      }

      // 通过 $attrs的取值
      let getter = publicProperties[key];
      if (getter) {
        return getter(instance);
      }
    },
    set(target, key, value, receiver) {
      const { state, props, setupState } = target;
      if (key in setupState) {
        setupState[key] = value;
        return true;
      } else if (state && key in state) {
        state[key] = value;
        return true;
      } else if (key in props) {
        // props是不允许修改的
        console.warn("不允许修改props");
        return true;
      }
      return true;
    },
  });

  let { data, render, setup } = type; // type: instance.vnode.type

  if (setup) {
    const context = {
      attrs: instance.attrs,
      emit(eventName, ...args) {
        // console.log("instance.attrs", instance.attrs);
        // attrs 上面的事件名字 onMyOutEvent,  emit("myOutputEvent", "哈哈")
        let bindName = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`;
        const handler = instance.attrs[bindName];
        if (handler) {
          let handlers = Array.isArray(handler) ? handler : [handler];
          handlers.forEach((handler) => handler(...args));
        }
      },
      expose(exposed) {
        // 主要用于ref ，通过ref获取组件的时候 在vue里只能获取到组件实例，但是在vue3中如果提供了
        // exposed 则获取的就是exposed属性
        instance.exposed = exposed;
      },
      slots: instance.slots,
      // 插槽的更新
      // 组件的生命周期
      // vue3中的靶向更新，编译优化原理ast语法树、代码转换、代码生成
      // 组件实现  provide\inject\....
      // pinia vue-router原理
      // compile()
      // 组件、树、表格、滚动组件
    };
    setCurrentInstance(instance); // 设置组件实例
    const setupResult = setup(instance.props, context); // setup只会在组件初始化的时候走一次 顶替了vue2  created beforeCreate
    setCurrentInstance(null); // 重置组件实例

    if (isFunction(setupResult)) {
      // setup中返回 render函数
      instance.render = setupResult;
    } else {
      // setup中返回的状态
      instance.setupState = proxyRefs(setupResult); // 将setup的返回值做拆包处理，无需在.value
    }
  }

  // const state = reactive(data())// 这样写会导致 vuecomponent 中的 data 里面取不到 this
  // vue3处理完之后才处理 vue2的逻辑，通过 call 使得vuecomponent中 data 函数里面取 this 可以取到 instance 中的数据
  if (isFunction(data)) {
    instance.state = reactive(data.call(instance.proxy)); // 获取数据，将数据变成响应式
  }
  if (!instance.render) {
    instance.render = render;
  }
}

// vue中 $attrs属性
const publicProperties = {
  $attrs: (i) => i.attrs, // proxy.$attrs().c
  $slots: (i) => i.slots, // proxy.$slots
};

// 初始化插槽
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children;
  }
};

// 初始化属性
const initProps = (instance, userProps) => {
  const attrs = {};
  const props = {};
  const options = instance.propsOptions || {}; // 组件上接受的props
  if (userProps) {
    for (let key in userProps) {
      // 属性中应该包含属性的校验
      const value = userProps[key];
      if (key in options) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  // 函数式组件
  if (instance.vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
    instance.props = attrs;
  } else {
    instance.attrs = attrs;
    instance.props = reactive(props);
  }
};
