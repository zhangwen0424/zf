import { activeEffect, reactive, ReactiveEffect } from "@vue/reactivity";
import { invokeArrayFn, ShapeFlags } from "@vue/shared";
import { PatchFlags } from "packages/shared/src/patchFlags";
import { isKeepAlive } from "./keepAlive";
import { createComponentInstance, setupComponent } from "./component";
import { Text, Fragment, isSameVnode, isVNode } from "./createVNode";
import { queueJob } from "./scheduler";
import { getSeq } from "./seq";

// 创建渲染器
export function createRenderer(renderOptions) {
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
    patchProp: hostPatchProp,
  } = renderOptions; // 这些方法和某个平台无关

  // 虚拟节点的创建 最终生成真实dom渲染到容器中
  // 1) 卸载  render(null,app)
  // 2) 更新 之前渲染过了， 现在在渲染  之前渲染过一次 产生了虚拟节点 ， 再次渲染产生了虚拟节点
  // 3) 初次挂载
  // patch
  const render = (vnode, container) => {
    // 虚拟节点的创建 最终生成真实dom渲染到容器中
    // console.log("render:", vnode, container);
    // debugger;
    if (vnode == null) {
      // 卸载逻辑
      if (container._vnode) {
        // 说明之前渲染过了，现在要移除掉
        unmount(container._vnode); // 虚拟节点中存放了真实节点
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };

  // 更新和初次渲染，初次渲染 n1的结果就是null， 如果是更新 n1,n2 都有值
  const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
    // n1 和 n2 就不是同一个元素  key 或者标签不一样
    // 把n1删除，重新挂载 n2
    if (n1 && !isSameVnode(n1, n2)) {
      // 需要更新
      unmount(n1, parentComponent);
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    switch (type) {
      // Text、Fragment在 createVNode中创建的，需要引进来
      case Text:
        // 文本节点
        processText(n1, n2, container);
        break;
      case Fragment:
        // 包裹节点
        processFragment(n1, n2, container, parentComponent);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 元素的处理，处理挂载和更新
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件的处理
          processComponent(n1, n2, container, anchor, parentComponent);
        }
    }
    // class 组件  函数式组件
    // 组件分成普通组件和函数式组件 （对于vue3 而言我们写的普通组件  通过调用render函数来返回虚拟节点的）
  };

  // 处理文本节点
  const processText = (n1, n2, el) => {
    if (n1 == null) {
      //创建
      hostInsert((n2.el = hostCreateText(n2.children)), el);
    } else {
      // 更新
      let el = (n2.el = n1.el); //复用文本
      if (n1.children === n2.children) {
        return;
      }
      hostSetText(el, n2.children);
    }
  };

  // 处理包裹节点，vue2 中所有的.vue 文件中template必须要有一个根节点来包裹内容
  const processFragment = (n1, n2, el, parentComponent = null) => {
    if (n1 == null) {
      mountChildren(n2.children, el, parentComponent, parentComponent);
    } else {
      patchKeyChildren(n1.children, n2.children, el, parentComponent);
    }
  };

  // 处理元素，处理挂载和更新
  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent);
    } else {
      // 元素更新了, 属性变化。 更新属性
      patchElement(n1, n2, parentComponent);
    }
  };

  // 处理组件
  const processComponent = (n1, n2, el, anchor, parentComponent) => {
    if (n1 == null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        // 组件缓存过了，不需要走挂载逻辑
        parentComponent.ctx.activated(n2, el, anchor);
      } else {
        mountComponent(n2, el, anchor, parentComponent);
      }
    } else {
      updateComponent(n1, n2, el, anchor, parentComponent); // 组件的属性变化了,或者插槽变化了
    }
  };

  // 挂载组件
  const mountComponent = (n2, el, anchor, parentComponent) => {
    // 1.拿到传入的 data、render
    // 2.创建响应式数据、响应式 effect、创建组件实例
    // 3.数据变化后会调用 componentUpdateFn进行组件的更新和挂载，通过批处理更新

    // 1 创建组件的实例
    const instance = createComponentInstance(n2, parentComponent);

    if (isKeepAlive(n2)) {
      instance.ctx.renderer = {
        // keep-alive 特有的
        createElement: hostCreateComment,
        move(vnode, el) {
          // keep-alive 缓存的一定是组件，不用判断vnode类型
          hostInsert(vnode.component.subTree.el, el);
        },
        unmount,
      };
    }

    // 2 启动组件 给组件实例复制
    setupComponent(instance);

    // 3) 渲染组件
    setupRendererEffect(instance, el, anchor);
  };

  // 渲染组件
  function setupRendererEffect(instance, el, anchor) {
    const componentUpdateFn = () => {
      // 组件要渲染的 虚拟节点是render函数返回的结果
      // 组件有自己的虚拟节点，返回的虚拟节点 subTree

      if (!instance.isMounted) {
        let { bm, m, vnode } = instance; // bm:beforeMount, m:mounted

        invokeArrayFn(bm); // beforeMount

        // 组件没有初始化，进行初始化
        let subTree;

        // 如果是函数式组件
        if (vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
          subTree = vnode.type(instance.props, { slots: instance.slots });
        } else {
          subTree = instance.render.call(instance.proxy, instance.proxy); //将 proxy设置为状态
        }

        patch(null, subTree, el, anchor, instance);
        instance.isMounted = true;
        instance.subTree = subTree; //记录第一次的 subTree

        invokeArrayFn(m); // mounted
      } else {
        // 更新
        const prevSubTree = instance.subTree;
        // 这里再下次渲染前需要更新属性，更新属性后再渲染，获取最新的虚拟ODM ， n2.props 来更instance.的props
        const { next, bu, u, vnode } = instance; // bu:beforeUpdate, u:updated

        if (next) {
          // 说明属性有更新
          updatePreRender(instance, next); // 因为更新前会清理依赖，所以这里更改属性不会触发渲染
        }

        invokeArrayFn(bu); // beforeUpdate
        // 考虑函数式组件的情况
        let nextSubTree;
        if (vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
          nextSubTree = vnode.type(instance.props, { slots: instance.slots });
        } else {
          nextSubTree = instance.render.call(
            // 这里调用render时会重新依赖收集
            instance.proxy,
            instance.proxy
          );
        }

        instance.subTree = nextSubTree; // 更新子树的虚拟节点
        patch(prevSubTree, nextSubTree, el, anchor);

        invokeArrayFn(u); // updated
      }
    };

    // 当调用 render 方法时调用响应式数据收集
    // 所以数据变化后会重新触发effect执行
    // 每个组件相当于一个 effect
    const effect = new ReactiveEffect(componentUpdateFn, () => {
      // 这里我们可以延迟调用componentUpdateFn，防止数据变化重复更新出现死循环
      // 批处理 + 去重
      queueJob(instance.update);
    });
    const update = (instance.update = effect.run.bind(effect)); //把当前 this 改为 effect;
    update();
  }

  // 在渲染前记得要更新变化的属性
  const updatePreRender = (instance, next) => {
    instance.next = null; // 清理暂存的节点
    instance.vnode = next; // 更新虚拟节点
    updateProps(instance, next.props);

    // 更新插槽
    // 如果是对象不能采用替换的方式，如果用户使用而能解构出来用，导致更新了插槽但是用户用的还是老的slots
    // 源码中还是要双方比较，更新slots
    Object.assign(instance.slots, next.children); // 新的儿子
  };

  // 更新新的属性
  function updateProps(instance, nextProps) {
    // 应该考虑一下 attrs 和 props
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

  // 更新组件
  const updateComponent = (n1, n2, el, anchor, parentComponent) => {
    // 这里我们 属性发生了变化 会执行到这里
    // 插槽更新也会执行这里

    const instance = (n2.component = n1.component);
    // debugger;
    // 内部props是响应式的所以更新 props就能自动更新视图  vue2就是这样搞的
    // instance.props.message = n2.props.message;

    // 这里我们可以比较熟悉，如果属性发生变化了，我们调用instance.update 来处理更新逻辑，统一更新的入口

    // 判定是否需要更新：1.属性变化 2.插槽变化
    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2; // 暂存新的虚拟节点
      instance.update();
    }
  };

  // 判定属性是否需要更新
  function shouldComponentUpdate(n1, n2) {
    const oldProps = n1.props;
    const newProps = n2.props;

    // 如果组件有插槽也需要更新
    // if (n1.childre !== n2.children) return true; // 遇到插槽 前后不一致就要重新渲染
    if (n1.childre || n2.children) return true; // 只要有孩子就需要更新

    if (oldProps == newProps) return false; // 属性一样就不需要更新

    return hasChanged(oldProps, newProps);
  }
  // 判定属性是否变化
  const hasChanged = (oldProps = {}, newProps = {}) => {
    // 直接看数量、数量后变化 就不用遍历了
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

  // 属性差异比较
  const patchElement = (n1, n2, parentComponent = null) => {
    let el = (n2.el = n1.el); // 将老的虚拟节点上的dom直接给新的虚拟节点
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    let { patchFlag } = n2;

    // 比较前后属性的差异 diff prop  靶向更新
    if (patchFlag) {
      if (patchFlag & PatchFlags.TEXT) {
        // 只比较文本
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    }
    // style 比较
    // class 比较  用更新后的差异 应用到老节点上
    else {
      patchProps(oldProps, newProps, el);
    }

    // 靶向更新子节点
    if (n2.dynamicChildren) {
      patchBlockChildren(n1, n2);
    } else {
      patchChildren(n1, n2, el, parentComponent);
    }
  };

  // 比较属性差异
  const patchProps = (oldProps, newProps, el) => {
    if (oldProps == newProps) return;
    // 循环新的属性添加进去
    for (let key in newProps) {
      // 真实操作dom
      let prevVal = oldProps[key];
      let nextVal = newProps[key];
      if (prevVal !== nextVal) {
        hostPatchProp(el, key, prevVal, nextVal);
      }
    }
    // 循环老的，在新的属性中没有则删除
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  // 比较双方的儿子节点的差异  text null []
  const patchChildren = (n1, n2, el, parentComponent) => {
    // text null [] * 3  = 9 种情况

    // 老的是空  新的是文本  x
    // 老的儿子是文本  新的儿子是文本x
    // 老的是数组 新的是文本  x
    // 老的是数组  新的也是数组 x
    // 老的有数组  新的没儿子 x
    // 老的是文本  新的没儿子 x
    // 老的儿子是文本 新的是数组 x
    // -----2--
    // 老的为空  新的是数组 x
    // 新的老的都没儿子 x

    // 全量diff算法  全量diff 就是从根开始比 ，比到最终的子节点
    // 递归先序 深度遍历  （全量diff 比较消耗性能，有些节点不需要diff） vue3 中有一种靶向更新的方式
    // 可以只比较动态节点
    // div;      div;
    // span;     span;
    // a;        a;
    // b;        b;
    // div       div
    // patchFlag + blockTree 编译优化 只有写模板的时候 才享受这种优化
    const c1 = n1.children;
    const c2 = n2.children;

    const prevShapeFlag = n1.shapeFlag; // 之前的形状
    const shapeFlag = n2.shapeFlag; // 之后的形状

    // 当前是文本呢   之前就是 空、文本、数组
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的是数组 ， 都移除即可，  hello   = [span,span]
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1, parentComponent);
      }
      // 新的是文本 老的可能是文本、或者空
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
      // ---3---
    } else {
      // 之前是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 双方都是数组   核心diff算法  ?? todo,,,
          patchKeyChildren(c1, c2, el, parentComponent);
        } else {
          // 现在是空的情况
          unmountChildren(c1, parentComponent);
        }
      } else {
        // 老的是文本 或者空
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        // 新的是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el, null, parentComponent);
        }
        // ---4--
      }
    }
  };

  // vue3 中的diff算法  1） 同序列挂载和卸载   2） 最长递增子序列 计算最小偏移量来进行更新
  const patchKeyChildren = (c1, c2, el, parentComponent) => {
    // 对diff算法进行优化的 , 先从前面比，在从后面比，这样可以确定，变化的部分
    //  a b    c d
    //  a b   e f   c  d

    let i = 0; // 开头的位置

    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 从头开始比 sync from start
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
    //  a b c
    //  a b d
    //  i, e1, e2    2 2 2
    // console.log("从头开始比:", i, e1, e2); // 2 2 2

    // 从后开始比较 sync from end
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
    // console.log("从后开始比:", i, e1, e2);
    //     a b c  =》 2 - 3
    // d e a b c  =》 4 - 3
    // i=0, e1=-1, e2=1
    // c2[e2 + 1] = a  a就是参照物，从 i开始循环在 a前面插入

    // abc    => 2
    // abcde  => 4
    // i=3, e1=2, e2 =4  这时候不需要参照物，参照物为 null

    // 插入和卸载节点
    if (i > e1) {
      // 新的多老的少，循环新的插入
      while (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = c2[nextPos]?.el; // 获取下一个元素的el
        // 我得知道是向前插入 还是向后插入，如果是向前插入得有参照物
        patch(null, c2[i], el, anchor);
        i++;
      }
    } else if (i > e2) {
      // 老的多，新的少，循环老的卸载
      while (i <= e1) {
        unmount(c1[i], parentComponent);
        i++;
      }
    }
    // abcde  => 4
    // abc    => 2
    // i =3 e1 = 4 e2 =2

    // deabc  => 4
    //   abc  => 2
    // i =0 e1 = 1 e2 =-1

    // --- 以上的情况 就是一些头尾的特殊操作，但是不适用其他情况----

    // a b [c d e]   f g  => 4
    // a b [d c e h] f g  => 6
    // i =2  e1 = 4  e2 =5

    // s1 - e1 [c d e]
    // s2 - e2 [d c e h]  // 这个其实不用移动 c和e只需要将d插入到c的前面 并且追加h就可以

    let s1 = i;
    let s2 = i;

    // console.log("s1, s2, e1, e2: ", s1, s2, e1, e2); // 2 2 4 5

    const keyToNewIndexMap = new Map();

    const toBePatched = e2 - s2 + 1; // 5-2+1  新的儿子有这个么多个需要被patch

    const newIndexToOldIndex = new Array(toBePatched).fill(0); // 记录老差异在新的里面对应的索引值，数组中值为 0 证明需要新增

    // 根据新的差异创建映射表
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }
    // console.log("keyToNewIndexMap:", keyToNewIndexMap); // Map(4) {'d' => 2, 'c' => 3, 'e' => 4, 'h' => 5}

    // 循环老的，看在新的差异映射表里面有没有，没有卸载，有的话更新或挂载
    // i：新老对首不一样的索引，s1: 老的不一样的索引，s2:新的对首不一样的索引，e1:老队尾不一样的索引，e2:新队尾不一样的索引
    // 循环老的：[c d e] 新的：Map(4) {'d' => 2, 'c' => 3, 'e' => 4, 'h' => 5}
    // i=2,s2=2  vode:c  newIndex:3  newIndexToOldIndex:[0,3,0,0]
    // i=3,s2=2  vode:d  newIndex:2  newIndexToOldIndex:[4,3,0,0]
    // i=4,s2=2  vode:e  newIndex:4  newIndexToOldIndex:[4,3,5,0]
    for (let i = s1; i <= e1; i++) {
      const vnode = c1[i];
      let newIndex = keyToNewIndexMap.get(vnode.key);
      if (newIndex == undefined) {
        // 老的里面有的新的没用
        unmount(vnode, parentComponent);
      } else {
        // 让被patched过的索引用老节点的索引作为标识，防止出现0的情况 + 1
        newIndexToOldIndex[newIndex - s2] = i + 1;
        // 用老的虚拟节点 c和新的虚拟节点做比对
        patch(vnode, c2[newIndex], el); // 这里只是比较自己的属性和儿子，并没有移动
      }
    }

    // console.log(newIndexToOldIndex); // [4,3,5,0]  最长递增子序列：【1 2】

    // 接下来要计算移动哪些节点 *最长递增子序列*
    // 如何复用 key

    // [3,7,9,2, 8,10]  根据数组中的值求出 对应递增子序列的索引，当倒叙插入的时候跳过对应的索引即可
    // [0,1,2,5]

    // 求最长递增子序列对应的索引
    const increasingNewIndexSequence = getSeq(newIndexToOldIndex); // [1, 2]
    // const increasingNewIndexSequence = getSeq([3, 5, 7, 4, 2, 8, 9, 11, 6, 10]); // [1, 2]
    // console.log("increasingNewIndexSequence:", increasingNewIndexSequence);
    let j = increasingNewIndexSequence.length - 1; // 取出数组的最后一个索引
    // 考虑移动问题、和新的有老的没有问题
    // 采用倒叙插入的方式 进行移动节点。 0 就是新增的
    //  a b[c d e]   f g
    //  a b[d c e h] f g   ->  [3,2,4,0] 这个数组可以用于标识哪些节点被patch过了
    //  [c d e]   f g
    //  [d c e h] f g   ->  [1,0,2,0] 这种情况会任务 c 是新增的，会有问题，所以需要+1
    // dom操作 只能向某个元素前面插入 insertBefore
    // h f
    // e h f
    // c e h f
    // d c e h f

    // toBePatched=4 新的中有多少个需要处理
    for (let i = toBePatched - 1; i >= 0; i--) {
      const curIndex = s2 + i; // 当前需要处理的元素索引 2+3  curIndex: 5,4,3,2
      // console.log("curIndex:", curIndex);
      const curNode = c2[curIndex]; // 当前需要处理的元素 vnode
      const anchor = c2[curIndex + 1]?.el; // 取到了f 参照物
      // patch中插入是虚拟节点做插入，hostInsert 中插入是节点做插入
      if (newIndexToOldIndex[i] == 0) {
        // h 新的里面没有没法直接插入，会把元素创建出来放到el 上
        patch(null, curNode, el, anchor);
      } else {
        // 已经有这个元素了直接做插入
        // 这里需要判断 当前i 和 j如果一致说明这一项不需要移动
        if (i == increasingNewIndexSequence[j]) {
          j--;
          // 如果当前这一项和 序列中相等，说明不用做任何操作，直接跳过即可
        } else {
          hostInsert(curNode.el, el, anchor); // 不在序列中意味着此元素需要移动
        }
      }
    }
  };

  const patchBlockChildren = (n1, n2) => {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      // 让两个动态节点比较，靶向更新
      patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i]);
    }
  };

  // 递归遍历 虚拟节点将其转换成真实节点
  const mountElement = (vnode, container, anchor = null, parentComponent) => {
    const { type, props, children, shapeFlag, transition } = vnode;
    const el = (vnode.el = hostCreateElement(type)); // 当前真实节点对应的虚拟 dom
    // 创建属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 创建儿子
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, children); // 是文本
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el, anchor, parentComponent); //是数组
      }
    }
    // 挂载之前调用钩子函数
    if (transition) {
      transition.beforeEnter(el);
    }
    // 创建真实节点
    hostInsert(el, container, anchor);
    if (transition) {
      transition.enter(el);
    }
  };

  // 循环挂载儿子，暂时不处理 ['abc','bced']
  const mountChildren = (children, container, anchor, parentComponent) => {
    children.forEach((child) => {
      patch(null, child, container, anchor, parentComponent);
    });
  };

  // 卸载节点、组件
  const unmount = (vnode, parentComponent = null) => {
    const { shapeFlag, type, children } = vnode;
    if (type == Fragment) {
      return unmountChildren(children, parentComponent);
    }
    if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
      // 告诉keepAlive组件 我需要的是将真实节点移动到缓存中
      parentComponent.ctx.deactivated(vnode);
      return;
    }

    // 组件卸载逻辑
    if (shapeFlag & ShapeFlags.COMPONENT) {
      let { subTree, bum, um } = vnode.component; // 组件实例 bum:beforeUnmounted, um:Unmounted

      bum && invokeArrayFn(bum);

      unmount(subTree, parentComponent); // 卸载返回值的对应的dom，返回值可能是一个fragment

      um && invokeArrayFn(um);
      return;
    }

    // 元素、文本卸载
    // if (shapeFlag & ShapeFlags.ELEMENT) {
    // hostRemove(vnode.el); // 对于元素来说 直接删除dom即可
    // }

    // 加入过渡的逻辑
    remove(vnode);
  };
  function remove(vnode) {
    const { el, transition } = vnode;
    const performRemove = () => {
      hostRemove(el); // 写成回调的方式
    };
    if (transition) {
      transition.leave(el, performRemove); //回调删除元素
    } else {
      performRemove();
    }
  }

  // 批量卸载儿子
  const unmountChildren = (children, parentComponent) => {
    children.forEach((child) => {
      unmount(child, parentComponent);
    });
  };

  return {
    render,
  };
}
// runtime-core中的createRenderer是不基于平台
