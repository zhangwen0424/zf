// 泛型可以用于 函数 对象 类...

// 根据长度 和 内容 创建一个数组
/* const getArray = (times: number, val: string): string[] => {
  let result = [];
  for (let i = 0; i < times; i++) {
    result.push(val);
  }
  return result;
}; */

// 重载，根据参数不同 处理结果不同
// 入参和返回值有映射关系
const getArray = <T>(times: number, val: T): T[] => {
  let result = [];
  for (let i = 0; i < times; i++) {
    result.push(val);
  }
  return result;
};

getArray<string>(3, "a"); // ['abc','abc','abc'] 当我使用的时候可以确定类型
getArray(3, 1); // ['abc','abc','abc'] 当我使用的时候可以确定类型

// 多个泛型来使用   元祖交换
/* function swap(turple: [string, number]): [number, string] {
  return [turple[1], turple[0]];
} */
/* function swap<T, U>(turple: [T, U]): [U, T] {
  return [turple[1], turple[0]];
} */
// type ISwap = <T, U>(tuple: [T, U]) => [U, T];
interface ISwap {
  <T, U>(tuple: [T, U]): [U, T];
}
const swap: ISwap = (tuple) => {
  return [tuple[1], tuple[0]];
};
let swapResult = swap(["a", true]);

// 1) 使用接口的时候确定的类型
type ICallback<T> = (item: T, idx: number) => void;
// type IForEach = <T>(arr: T[], callback: ICallback<T>) => void;
type IForEach = <T extends string | number>(
  arr: T[],
  callback: ICallback<T>
) => void;
// 2) 在调用函数的时候确定了类型
// type ICallback1 = <T>(item: T, idx: number) => void;
/* const forEach = <T>(arr: T[], callback: ICallback<T>) => {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i); // callback 没有执行， 所以无法推导arr[i] = T
  }
}; */
const forEach: IForEach = (arr, callback) => {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i); // callback 没有执行， 所以无法推导arr[i] = T
  }
};
forEach(["A", "B", "C"], function (item, idx) {
  console.log(item);
});

export {};
