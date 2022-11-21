// 接口 抽象类（有抽象的和非抽象的）和接口（都是抽象的） 接口没有具体的实现
// 用来描述形状的 （结构）  定义结构到时候让用户去实现

// 描述形状（对象、类、函数、混合类型）
// 定义一些含没有实现的内容

// type IFullname = {
//   firstname: string;
//   lastname: string;
// };
interface IFullname {
  firstname: string;
  lastname: string;
}
const getFullName = ({ firstname, lastname }: IFullname) => {
  return firstname + lastname;
};
getFullName({ firstname: "j", lastname: "w" });

// type 和 interface的区别
// interface 通常描述 对象、类的结构比较多，type来描述函数的签名、联合类型、 工具类型、映射条件类型
// 在描述的时候 尽量用type。 不能用考虑interface

// type 优点：可以用联合类型 type 不能重名 , type中可以用后续的条件类型、映射
// interface 能重名、可以被扩展和实现、继承、混合类型

// 混合类型，只能用 interface
// 方法计数器， 调用+1
interface ICount {
  count: number;
  (): number;
}
// 因为let声明的变量可以修改，改了后可能属性就不存在了，意味着可能访问不到。 不安全
const counter: ICount = () => {
  return counter.count++;
};
counter.count = 0;
counter();
console.log("counter", counter.count); //counter 1

// 对象采用接口来实现 描述后端返回的数据结构

interface IVeg {
  // 接口叫抽象的没有具体实现
  color: string;
  taste: string;
  size: number;
  // xx?: number; // --2》采用可选属性来标识
  // 对象的key 可以有三种类型 string number symbol
  [key: string]: any; // --5》任意属性
}

// 1）as断言后可以直接赋值, 但是不能取多余的属性，因为不知道有没有
// 2) 采用可选属性来标识
// 3) 我在基于当前类型声明一个新的类型
// 4) 同名接口可以合并
// 5) 可以采用任意类型

// --1》断言
/* let veg: IVeg = {
  color: "red",
  taste: "sour",
  size: 10,
  xx: 12,
} as IVeg; // 比接口中多的 xx 会被忽略掉 */

// --3》基于当前类型声明一个新的类型
interface IVegWithX extends IVeg {
  xx?: number;
}
let veg: IVegWithX = {
  color: "red",
  taste: "sour",
  size: 10,
  xx: 100,
};

// --4》同名接口可以合并
interface IVeg {
  // readonly xx?: number;
}
let veg1: IVeg = {
  color: "red",
  taste: "sour",
  size: 10,
  xx: 100,
  bb: 123,
  [Symbol()]: 11,
};

// 任意类型 -》 索引类型
interface IArr {
  [key: number]: any; // 可能是数字索引、数组
}
const arr: IArr = [1, 2, 3, "abc"];
const obj: IArr = {
  0: 200,
  "1": 20,
  2: 200,
};

// 可以通过索引访问符来访问接口中的属性类型

interface Person {
  name: string;
  sex: string;
  age: number;
  address: { num: 316 };
  // [key: string]: any;  如果写了任意类型，则去出的val 就是任意类型
}

type PersonName = Person["name"];
type PersonNum = Person["age"];
type PropTypeUnion = keyof Person; // 取key name | age | address
type PropTypeValueUnion = Person[keyof Person]; // 取值 string | {num:316}
let a: PropTypeUnion = "age";

// 接口最常用的就是描述对象，可以通过索引操作【】来访问内部类型

// 类接口, 描述类中的属性和方法。
interface Speakable {
  name: string;
  speak: () => void; // 实例
  // speak(): void; // 原型
}
interface SpearkChinese {
  speakChinese(): void;
}
// 实现某个类型
interface SpeakEngilsh extends Speakable, SpearkChinese {
  speakEnglish(): void;
}
// Speak 实现 xxx, 需要有 xxx 定义的属性和方法
class Speak implements SpeakEngilsh {
  name: string;
  // ts中对实例和原型校验不严格
  speak(): void {
    throw Error("Method not implemented.");
  }
  speakEnglish(): void {
    throw new Error("Method not implemented.");
  }
  speakChinese(): void {
    throw new Error("Method not implemented.");
  }
}

// 描述构造函数类型. 类类型 描述的是实例，想获取到类本身的类型 需要采用 typeof 获取
class Animal {}
class Meat {}
interface Clazz<Txx> {
  new (): Txx;
}
// typeof Clazz -> new (): Clazz;类类型，可以 new，并且返回类的实例
// 泛型类似于函数的参数 , 泛型的声明一般采用一个大写（开头）字母来表示
function createInstance<Txx>(clazz: Clazz<Txx>) {
  return new clazz();
}
// let instance = createInstance<Meat>(Meat); // 类似的映射关系，是在使用的时候定义的
let instance = createInstance(Meat); // <Meat>可省略，ts 中类型会自动推导

export {};
