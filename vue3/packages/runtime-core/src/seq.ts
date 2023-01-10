// 如何求最长递增子序列 -》  最终序列的索引是我们要的结果

// 1. 先求出最长递增子序列的个数

//     p:    0  1  0     2  5  6   3  6
//   arr: 3  5  7  4  2  8  9  11  6  10  (贪心 + 二分查找)  => result: [4, 3, 8, 5, 6, 9]
// index: 0  1  2  3  4  5  6  7   8  9

// 找更有潜力的一项 作为末尾
// 3
// 3 5
// 3 5 7
// 3 4 7 (递增序列差找某个元素 可以使用二分查找，找到比4大的那一项，将其换掉)
// 2 4 7
// 2 4 7 8
// 2 4 7 8 9
// 2 4 7 8 9 11
// 2 4 6 8 9 11
// 2 4 6 8 9 10

// 从最后一项10 开始按照前索引找，10 前一项索引为 6，6 对应 9，9前一项索引为 5，以此类推
// [0, 1, 2, 5, 6, 9] =》 [3,5,7,8,9,10]

// 2. 有了个数 我们可以采用倒叙追踪的方式，查找正确的序列

// 3 5 7 8 9 10

// [1,2,3,4,5,6,7,8,9,0] -> [0,1,2,3,4,5,6,7,8]

// 2, 3, 1, 5, 6, 8, 7, 9, 4
export function getSeq(arr) {
  const result = [0];
  const len = arr.length;

  let start, end, middle;
  const p = arr.slice(0).fill(-1); // 用来存储标记的索引， 内容无所谓主要是和数组的长度一致

  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    // 0 不用管，在 vue 中做新增
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1];
      // 和arrI中的去比较  比末尾大，直接追加
      if (arr[resultLastIndex] < arrI) {
        result.push(i);
        p[i] = resultLastIndex; // 记录上一次最后一个人的索引
        continue;
      }
      // 如果比当前末尾小，需要通过二分查找找到比当前这一项大的用这一项替换掉他
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0; // 向下取值
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // 最终start 和 end 会重合
      p[i] = result[start - 1]; // 记录前一个人的索引
      result[start] = i; // 找到比当前值大的，直接用当前的索引换掉
    }
  }
  // console.log("p:", p, result);
  // 实现倒序追踪
  let i = result.length; // 总长度
  let last = result[i - 1]; // 获取最后一项
  while (i-- > 0) {
    result[i] = last; // 最后一项是正确
    last = p[last]; // 通过最后一项找到对应的结果，将他作为最后一项来进行追踪
    // debugger;
  }
  return result;
}
// console.log(getSeq([2, 3, 1, 5, 6, 8, 7, 9, 4])); // result: [0, 1, 3, 4, 6, 7]
