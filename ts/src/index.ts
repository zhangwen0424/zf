// 类型保护  js + ts

// ts 默认在使用的时候 都是联合类型， 不能直接使用联合类型。 识别类型，针对某一种类型进行处理
// 对不同的类型进行范围缩小

// typeof 类型保护
// instanceof 类型保护
// in 保护
function double(a: string | number) {
  if (typeof a == "string") {
    return a + a;
  } else {
    return a * 2;
  }
}

class Person {}
class Dog {}
function getInstance(clazz: new (...args: any[]) => Dog | Person) {
  return new clazz();
}
let p = getInstance(Person);
if (p instanceof Person) {
  p; //let p: Person
} else {
  p; //let p: Dog
}

// 通过js 来判断，差异是通过ts来实现的。 可辨识类型
interface Bird {
  fly: string;
  kind: "鸟";
}
interface Fish {
  swim: string;
  kind: "鱼";
}
function getType1(type: Bird | Fish) {
  //  可辨识类型
  if ("swim" in type) {
    type; // type: Fish
  } else {
    type; // type: Bird
  }
}
function getType2(type: Bird | Fish) {
  // 可辨识类型
  if (type.kind == "鸟") {
    type;
  } else {
    type;
  }
}

// 确保一个变量是数组
function ensureArray<T>(input: T | T[]): T[] {
  // 类型来辨识
  if (Array.isArray(input)) {
    return input;
  } else {
    return [input];
  }
}

// > 可辨识的联合类型

export {};
