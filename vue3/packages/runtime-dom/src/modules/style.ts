export function patchStyle(el, prevVal, nextVal) {
  // 循环新的属性直接赋值，循环老的看新的有没有，没有则删除
  const style = el.style; // 最终的操作就是他
  if (nextVal) {
    // 这些一定是要生效的，用新的样式直接添加即可
    for (let key in nextVal) {
      style[key] = nextVal[key];
    }
  }
  if (prevVal) {
    for (let key in prevVal) {
      if (nextVal[key] == null) {
        style[key] = null; // 删除老对象中的样式即可
      }
    }
  }
}
