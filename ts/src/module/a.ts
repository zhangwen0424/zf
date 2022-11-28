// export default "a";

// export = {
//   a: 1,
// };

export namespace Zoo {
  export class Dog {
    a = 1;
  }
}
namespace Home {
  class Dog {}
}
Zoo.Dog;
// Home.Dog; //报错
