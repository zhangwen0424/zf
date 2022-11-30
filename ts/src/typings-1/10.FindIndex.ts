// 1） 找到两个值相等的一项，如何判断两个值是否相等？
// 2) 最终要返回的是索引， 内部构建一个数组，来记录当前遍历到了第几项
type a1 = [any, never, 1, "2", true];
type a2 = FindIndex<a1, 1>; // 2
type a3 = FindIndex<a1, 3>; // never
