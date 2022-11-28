// export default "a";

// export = {
//   a: 1,
// };

export namespace Zoo {
  export let a = "1";
  export class Dog {
    a = 1;
  }
}
namespace Home {
  class Dog {}
}
Zoo.Dog;
Zoo.a;

// 命名空间的嵌套
export namespace Earth {
  export namespace Contry {
    export class China {}
    export class America {}
  }
}
console.log(Earth.Contry.China);

// 命名空间可以用于扩展类、函数、枚举。
class A {
  static b = "b";
}
namespace A {
  export let a = "a";
}
A.a;
A.b;

function counter(): number {
  return counter.count++;
}
// 命名空间会合并，需要放到后面
namespace counter {
  export let count = 0;
}

enum ROLE {
  user,
}
namespace ROLE {
  export let admin = 1;
}
ROLE.user;
ROLE.admin;

// 因为有了外部模块
