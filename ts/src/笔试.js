/******************* LRU ****************/
class LRUCache {
  constructor(length = 0) {
    this.length = length;
    this.data = new Map();
  }
  set(key, value) {
    let data = this.data;
    if (data.has(key)) {
      data.delete(key);
    }
    data.set(key, value);
    if (data.size > this.length) {
      data.delete(data.keys().next().value);
    }
  }
  get(key) {
    let data = this.data;
    if (!data.has(key)) {
      return null;
    }
    let value = data.get(key);
    data.delete(key);
    data.set(key, value);
  }
}
const lru1 = new LRUCache(2);
lru1.set("1", 1);
lru1.set("2", 2);
lru1.set("3", 3);
console.log(lru1);

/******************* 模板字符串 ****************/

let name = "zhangsan";
let age = 19;

let str = `name:${name}, age:${age}`;
let reg = str.replace(/\$\{([^}]*)\}/g, function () {
  return eval(arguments[1]);
});
console.log(str);
