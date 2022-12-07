// 装饰器的概念： 本质就是一个函数，只能扩展类和类的成员
// 装饰器的语法是ES7的实验性语法，装饰器不是预设版本，使用需要配置，tsconfig.json 中启用装饰器, "experimentalDecorators": true

function Decorator(target: any) {
  // 给类本身添加属性和方法;
  target.type = "动物";
  target.getType = function () {
    return this.type;
  };
  target.prototype.eat = function () {
    console.log("eat");
  };
  target.prototype.drink = function () {
    console.log("drink");
  };
}
// 可以返回子类，这个子类用于重写父类
function OverrideAnimal(target: any) {
  // 可以直接对父类进行重写
  return class extends target {
    eat() {
      super.eat();
      console.log("child eat");
    }
  };
}
@Decorator
class Animal {}
// 在类中使用属性，需要通过命名空间
// namespace Animal {
//   export const type: string = "";
// }
// console.log(Animal.type);
console.log((Animal as any).getType());
