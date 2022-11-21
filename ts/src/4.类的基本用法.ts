// 类：类的组成部分： 构造函数、属性（实例属性、原型属性）、方法（实例方法、原型方法、访问器get、set）  静态的属性和方法

// 所有的实例上的属性都需要先声明再使用，简化方法：使用类的修饰符
class Circle {
  // 默认值、可选参数、剩余运算符
  x: number;
  y: number;
  constructor(x: number, y: number = 0, ...args: number[]) {
    this.x = x;
    this.y = y;
  }
}
let circle = new Circle(100);
console.log(circle); // { x: 100, y: 0 }

// 类的修饰符  public (公开的 我自己、我的儿子、外界)  protected (受保护的 我自己、我的儿子)  private （私有的 private）
// readonly 仅读的

/* class Animal0 {
  public name!: string;
  public age!: number;
  constructor(name: string, age: number) {
    // 下面的必须写，属性才能添加进入
    this.name = name;
    this.age = age;
  }
}
let animal = new Animal0("猴子", 10);
// animal.name = "老虎";// 可以更改
console.log("animal0", animal); // { name: '猴子', age: 10 }
 */
// 简写
class Animal {
  // 直接在参数中添加 public prvitate protected 这些属性会默认添加到实例
  constructor(public readonly name: string, public age: number) {
    this.name = "abc"; // 因为在构造函数中是初始化阶段 readonly的值是可以修改的
  }
  // changeName(name: string) {
  //   this.name = name; // 这里如果是readonly属性则不能再修改了
  // }
}
let animal1 = new Animal("大象", 10);
// animal1.name = "abc"; //添加了 readonly 属性，这里报错，不可以更改
console.log("animal1", animal1); //{ name: 'abc', age: 10 }

class Cat extends Animal {
  public address: string;
  constructor(name: string, age: number) {
    super(name, age); // Animal.call(this,name,age);
    this.address = "中国"; //添加类中的属性
  }
}
let cat = new Cat("Tom", 10);
console.log("cat", cat); // { name: 'abc', age: 10, address: '中国' }

// 属性 分为 静态属性 实例属性  原型属性
// （实例和原型的区别）  原型是共享的， 实例就是每个人都有的
class A {
  static type = "哺乳类";
  // 类中如何声明原型属性？
  private _name: string = "Tom";
  get name() {
    // 类的访问，访问的是 原型上的属性
    return this._name;
  }
  set name(newValue) {
    this._name = newValue;
  }
}
let a = new A();
let b = new A();
// 静态属性只能通过类来访问
console.log("a==b", a.name === b.name, A.type); // false 哺乳类

// 子类中重写父类的方法 要求必须和父类的方法类型一致
class Animal2 {
  static getType() {
    return "动物类";
  }
  public eat: () => void; // 实例方法，必须先声明
  constructor() {
    this.eat = () => {};
  }
  say(name: string, age: number): void {
    console.log("父 say");
    // return "abc";
  } // 不关心返回值 原型方法
}
class Mouse extends Animal2 {
  static getType() {
    console.log("子");
    // 调用父类
    super.getType(); // Animal2.getType();
    return "动物";
  }
  say(name: string) {
    // 兼容父类，组合优先于继承
    // 父类返回值为void， 子类可以随便实现
    console.log("子say");
    super.say("name", 1); // 调用父类原型的 say 方法
    return "abc";
  }
}
console.log("animal2", Animal2.getType());
let mouse = new Mouse();
mouse.say("name");
// super 父类  、 父类的原型

// 正常类中： 原型属性 (get xxx 属性访问器来实现) 、原型方法 Animal.prototype
// 实例属性 实例方法  声明在实例上的
// 静态属性 静态方法  类上的
// super 在构造函数中、静态方法中super指向的是父类
// 在原型方法中super指向的是父类的原型

// 实例属性要提前声明  修饰符 private protected public readonly
class Animal3 {
  private constructor() {} // 使用 private 修饰符下面会报错
}
// 构造函数中增加了 private 和 protected 意味着不能再被new了
// class E extends Animal3 {}
// new Animal3(); //报错，类“Animal3”的构造函数是私有的，仅可在类声明中访问

// 单例模式
class Singleton {
  static instance = new Singleton();
  private constructor() {}
  static getInstance() {
    return this.instance;
  }
}
let instance1 = Singleton.getInstance();
let instance2 = Singleton.getInstance();
console.log("instance1 == instance2", instance1 == instance2); // true

// 不能被new的 可以采用抽象类， 抽象类中可以采用抽象方法
abstract class Person {
  // 抽象类中可以有非抽象的方法
  drink() {
    console.log("drink");
  }
  // abstract eat: () => void;// 实例方法
  abstract eat(): void; // 原型方法，父中有抽象方法，需要子类来实现一个eat方法
}
class Teacher extends Person {
  // eat() {}
  eat: () => void;
  constructor() {
    super();
    this.eat = function () {
      return 123;
    };
  }
  // eat(): void {
  //   console.log("eat");
  // }
}
// new Person(); //报错：无法创建抽象类的实例
new Teacher();
// 装饰器
export {};
