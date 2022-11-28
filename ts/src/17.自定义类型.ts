// 自定义类型

// Exclude Extract集合的操作
// Pick Omit 对对象结构的操作
// Partial Required Readonly 起修饰作用的
// ReturnType Paramaters InstanceType .... (基于infer)
// Pick Omit 对对象结构的操作

// 让部分属性 变为可选属性 怎么办？

interface Company {
  name: string;
  num: number;
}
interface Person<T = any> {
  name: string;
  age: number;
  address: string;
}
// 映射属性值
type Compute<T extends object> = {
  [xxxx in keyof T]: T[xxxx]; // 映射
};

// 先将name属性挑出来变为可选的  &   除了name属性的
type PartialPropsOptional<T, K extends keyof T> = Partial<Pick<T, K>> &
  Omit<T, K>;
type x1 = Compute<PartialPropsOptional<Person, "name">>; // type x1 = { name?: string; age: number; address: string; }

// 以前是根据key 来选属性
// 根据值的类型 来选择 key

// 把接口中 string 类型取出来
type isEqual<T, U, Success, Fail> = [T] extends [U] // []数组包裹作用禁止分发
  ? [U] extends [T]
    ? Success
    : Fail
  : Fail;
/* // 不满足条件的属性类型为 never, {name:'name', age:never, address:‘address’,...}
type ExtractKeysByValueType<T, U> = {
  [K in keyof T]: isEqual<T[K], U, K, never>;
}[keyof T]; // 找到需要的属性 在通过属性选出来既可以了,never不在联合类型中，返回 name | address
// type x = Person[keyof Person]; // keyof索引取值,  type x = string | number
type PickKeysByValue<T, U> = Pick<T, ExtractKeysByValueType<T, U>>;
type x2 = PickKeysByValue<Person, string>; // type x2 = { name: string; address: string; }
// 如果是Omit如何编写?
type OmitKeysByValueType<T, U> = {
  [K in keyof T]: isEqual<T[K], U, never, K>;
}[keyof T];
type OmitKeysByValue<T, U> = Pick<T, OmitKeysByValueType<T, U>>;
type x3 = OmitKeysByValue<Person, string>; */

// 抽离合并ExtractKeysByValueType、OmitKeysByValueType
type ExtractKeysByValueType11<T, U, O = false> = {
  [K in keyof T]: isEqual<
    T[K],
    U,
    isEqual<O, true, never, K>,
    isEqual<O, true, K, never>
  >;
}[keyof T];
type PickKeysByValue<T, U> = Pick<T, ExtractKeysByValueType11<T, U>>;
type x2 = PickKeysByValue<Person, string>; // type x2 = { name: string; address: string; }
type OmitKeysByValue<T, U> = Pick<T, ExtractKeysByValueType11<T, U, true>>;
type x3 = OmitKeysByValue<Person, string>;

// 简化写法，使用双重映射
type PickKeysByValueS<T, U> = {
  // as 语法 映射成一个新的变量，变量为一个条件
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};
type x22 = PickKeysByValueS<Person, string>;

// 求对象的交集 Pick Omit Exclude Extract

type A = {
  name: string;
  age: number;
  address: string;
};
type B = {
  name: string;
  // age: number;
  address: number;
  male: boolean;
};

// 求交集，两个都有 （name:string,address:number）
type ObjectInter<T extends object, U extends object> = Pick<
  U,
  Extract<keyof T, keyof U> // name,address
>;
type X1 = ObjectInter<A, B>;

// 求对象的差集  B - A . Omit+Extract == Pick + Exclude
type ObjectDiff<T extends object, U extends object> = Omit<
  U,
  Extract<keyof T, keyof U> // name,address
>;
type X2 = ObjectDiff<A, B>; // type X2 = {  male: boolean; }

// 求补集, A中包含 B 中所有属性
// type ObjectComp<T extends object, U extends T> = Omit<
//   U,
//   Extract<keyof T, keyof U>
// >;
// type X3 = ObjectComp<B, A>; // type X3 = { address: string; }

// 重写A 类型
// A=> {name:string,age:number,address:number}
type Overwrite<T extends object, U extends object> = ObjectDiff<U, T> &
  ObjectInter<T, U>;

type X4 = Compute<Overwrite<A, B>>;

// 类型互斥问题
interface Man1 {
  fortune: string; // 有钱的男人
}
interface Man2 {
  funny: string; // 有趣的男人
}
interface Man3 {
  foreign: string;
}
// 只能赋值其中一种  1.将对方类型标识成 never  2.取交集
// type Discard<T, U> = {
//   [K in Exclude<keyof U, keyof T>]: never;
// };
type Discard<T, U> = {
  [K in Exclude<keyof U, keyof T>]?: never;
};
// type XX = Compute<Discard<Man1, Man2> & Man1>;
type OrType<T, U> = (Discard<T, U> & T) | (Discard<U, T> & U);
type ManType = OrType<Man1, OrType<Man2, Man3>>;
let type: ManType = {
  fortune: "",
  // funny: "",
  // foreign: "",
};

export {};
