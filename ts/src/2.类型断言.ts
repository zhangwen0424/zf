// 声明一个变量没有给类型的时候 默认类型是any
const name = "zw";
// const let 区别  const意味着值不能发生变化，类型范围更小， let 可以改变值， 会推断的范围大

// 联合类型 , 联合类型 在没有确定值之前， 只能采用联合类型中的方法。 只有确定特定类型后 才能使用对应的方法
let strOrNum: string | number;

// ! 非空断言，我断定这个变量 一定有值. 出错了 自负责
strOrNum = "abc";
strOrNum.toLowerCase();

strOrNum = 13;
strOrNum.toFixed();

// 联合类型 是并集 还是 交集呢？  并集意味着 全部的意思  交集 意味着两者共有的东西

// --1> 非空断言

// ?. 是js语法 叫链判断运算符， 这个值没有就不取值了
// ! 意味着这个值存在 这个事ts语法
let ele = document.getElementById("root");
ele.style.background = "red"; // ! 我意味着认定这个元素一定有值

// ?? || && 都是js语法  ??左侧为null和undefined时，才返回右侧的数
let r = 0 ?? "a"; // 0 也是false 但是 可以返回  js语法
console.log(r);

// --2> 我们需要将某个类型直接作为某个类型来使用 类型断言
let strOrNum1: string | number;
(strOrNum1! as string).toLocaleLowerCase(); // 类型断言
(<number>strOrNum1!).toFixed(2); // 下面这种不推荐使用

// 断言只能断言成一个已经存在的类型，如果不存在不能直接断言
strOrNum1! as any as boolean; // 缺点就是 会破坏原有的类型, 不建议使用

// 断言： 我可以自己指定特定的类型

// 字面量类型
const username: "jw" = "jw";
const password: 123456 = 123456;

// 字面量类型和联合类型 放在一起用 就更加灵活了
type Direction = "Left" | "right";
let direction: Direction = "right"; // 字面量类型 就是限定了值 和 枚举类似

export {};
