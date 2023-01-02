// 节点操作 api
export const nodeOps = {
  // 创建元素
  createElement(element) {
    return document.createElement(element);
  },
  // 创建文本
  createText(text) {
    return document.createTextNode(text);
  },
  //元素插入
  insert(element, container, anchor = null) {
    container.inserBefore(element, anchor);
  },
  // 元素删除
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  // 元素查询
  querySelector(selector) {
    return document.querySelector(selector);
  },
  // 设置文本内容  innerHTML不可以用，会有 xss 攻击
  setElementText(element, text) {
    element.textContent = text; // 设置元素的内容
  },
  // 设置文本节点内容
  setText(textNode, text) {
    textNode.nodeValue = text;
  },
  createComment: (text) => document.createComment(text), //创建注释节点
  nextSibling: (node) => node.nextSibling,
  parentNode: (node) => node.parentNode,
};
