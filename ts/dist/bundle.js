(function () {
  'use strict';

  /******************* 元素交换 ****************/
  // 元祖交换
  function swap1(tuple) {
      return [tuple[1], tuple[0]];
  }
  console.log(swap1([1, "a"]));
  // 泛型实现数组元素交换
  function swap2(tuple) {
      return [tuple[1], tuple[0]];
  }
  console.log(swap2(["a", 112]));
  const swap3 = (tuple) => {
      return [tuple[1], tuple[0]];
  };
  console.log(swap3([1, "223"]));

})();
//# sourceMappingURL=bundle.js.map
