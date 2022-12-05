let person = {
  name: "mornki",
  get aliasName() {
    return this.name; // this -> person
  },
};

// 使用 proxy的时候搭配 Reflect来解决 this 问题
let proxyPerson = new Proxy(person, {
  get(target, key, receiver) {
    console.log("receiver", receiver, key);
    /* 
      1、不使用 Reflect 时，访问aliasName 只会触发 person 上的方法，不触发 name设置，拦截不到 name，当 name变化时无法更新
        receiver { name: 'mornki', aliasName: [Getter] } aliasName
      2、使用 Reflect时，访问 aliasName 会触发 name设置 
        receiver { name: 'mornki', aliasName: [Getter] } aliasName
        receiver { name: 'mornki', aliasName: [Getter] } name
    */
    // return target[key]; // target是person person.aliasName
    return Reflect.get(target, key, receiver); // call
  },
  // set(){

  // }
});

// 在获取aliasName的时候 也希望让name属性也会触发get
proxyPerson.aliasName; // 假如说我在页面中使用了aliasName , 会有aliasName对应了页面，但是没有创造name和页面的关系

proxyPerson.name = "xxx";
console.log("proxyPerson", proxyPerson);
