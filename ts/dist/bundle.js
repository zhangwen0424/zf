(function () {
  'use strict';

  // 装饰器的概念： 本质就是一个函数，只能扩展类和类的成员
  // 装饰器的语法是ES7的实验性语法，装饰器不是预设版本，使用需要配置，tsconfig.json 中启用装饰器, "experimentalDecorators": true
  var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  function Decorator(target) {
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
  let Animal = class Animal {
  };
  Animal = __decorate([
      Decorator
  ], Animal);
  // 在类中使用属性，需要通过命名空间
  // namespace Animal {
  //   export const type: string = "";
  // }
  // console.log(Animal.type);
  console.log(Animal.getType());

})();
//# sourceMappingURL=bundle.js.map
