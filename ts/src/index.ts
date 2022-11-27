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

type A = {
  name: string;
  age: number;
  address: string;
};
// 求对象的交集 Pick Omit Exclude Extract

export {};
