/******************* 元素交换 ****************/
// 元祖交换
function swap1(tuple: [number, string]): [string, number] {
  return [tuple[1], tuple[0]];
}
console.log(swap1([1, "a"]));
// 泛型实现数组元素交换
function swap2<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}
console.log(swap2(["a", 112]));
// 接口实现
// type swapType = <T, U>(tuple: [T, U]) => [U, T];
interface swapType {
  <T, U>(tuple: [T, U]): [U, T];
}
const swap3: swapType = (tuple) => {
  return [tuple[1], tuple[0]];
};
console.log(swap3([1, "223"]));

/******************* LRU ****************/
class LRU {
  cache: Map<number, number>;
  constructor(public capacity: number) {
    this.cache = new Map();
  }
  // cache: Map<number, number>;
  // constructor(public capacity: number) {
  //   this.cache = new Map();
  // }
  // set(key: number, value: number) {
  //   if (this.cache.has(key)) {
  //     this.cache.delete(key);
  //   }
  //   this.set(key, value);
  // }
}

/******************* 数组的声明 ****************/

interface MyArray<T> {
  length: number;

  // 添加
  push(...args: T[]): number;
  unshift(...args: T[]): number;

  // 删除
  pop(): T | undefined;
  shift(): T | undefined;
  splice(start?: number, deleteNum?: number): T[];
  splice(start: number, deleteNum?: number): T[];
  splice(start: number, deleteNum: number, ...args: T[]): T[];

  // 遍历
  forEach(
    callbackFn: (value: T, index: number, array: T[]) => void,
    thisArg?: any
  ): void;
  reduce(
    callbackFn: (preVal: T, curVal: T, curIndex: number, arr: T[]) => T,
    initialVal: T
  ): T[];
  // reduceRight
  // map
  // some
  // every
}
