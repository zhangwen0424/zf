export const Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    // 在遇到这个Teleport 组件的时候vue就不管了
    // 将虚拟节点，容器，参照物给你，你自己去操作
    const { mountChildren, patchChildren } = internals;
    if (!n1) {
      // 初始化
      debugger;
      let target = (n2.target = document.querySelector(n2.props.to));
    } else {
    }
  },
  remove(vnode) {},
};

export const isTeleport = (val) => {
  return !!val.__isTeleport;
};
