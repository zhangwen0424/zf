class Parent {
  house() {}
}
class Child extends Parent {
  car() {}
}
class Grandson extends Child {
  sleep() {}
}
function fn(callback: (instance: Child) => Child) {
  let r = callback(new Child()); // 你要的我都用，兼容
  // r.car;
  // instance = new Child();
  // instance = new Grandson()
}

fn((instance: Child) => {
  // instance = Parent | Child
  // instance.car;
  return new Child();
});

function fn1(callback: (a: string | number) => boolean | string) {
  callback("string");
  callback(123);
}
fn1((a: boolean | string | number) => {
  // return "abc";
  return true;
});

type Arg<T> = (arg: T) => void;
type xx = Arg<boolean | string | number> extends Arg<string | number>
  ? true
  : false; // 逆变， type xx = true

export {};
