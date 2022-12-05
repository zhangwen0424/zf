// 装饰器的概念： 本质就是一个函数，只能扩展类和类的成员
// 装饰器的语法是ES7的实验性语法，装饰器不是预设版本，使用需要配置，tsconfig.json 中启用装饰器, "experimentalDecorators": true
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
// 可以返回子类，这个子类用于重写父类
function OverrideAnimal(target) {
    return /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.eat = function () {
            _super.prototype.eat.call(this);
            console.log("child eat");
        };
        return class_1;
    }(target));
}
var Animal = /** @class */ (function () {
    function Animal() {
    }
    Animal = __decorate([
        Decorator
    ], Animal);
    return Animal;
}());
// 在类中使用属性，需要通过命名空间
// namespace Animal {
//   export const type: string = "";
// }
// console.log(Animal.type);
console.log(Animal.getType());
