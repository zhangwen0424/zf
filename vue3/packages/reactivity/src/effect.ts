// 类似 watch、computed
export const effect = function (fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
};

export let activeEffect = undefined; // 暴露为全局的，当前执行的 effect

// 存储当前 effect, ReactiveEffect类，便于扩展，实现一些方法
export class ReactiveEffect {
  // public修饰符， 默认会将fn挂载到类的实例上
  constructor(public fn) {}
  parent = undefined;
  deps = []; // 我依赖了哪些 effect 列表
  run() {
    // 保证嵌套的 effect 能被 track
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this); // 清理了上一次的依赖收集, 重新收集
      return this.fn(); // fn()会触发依赖收集
    } finally {
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
}

// 依赖收集， 属性--》多个 effect, effect--》多个属性
// weakmap : map : set
// {name:'mornki'}:'name' -> [effect,effect]
//                :'age'  -> [effect]
const targetMap = new WeakMap();
export const track = function (target, key) {
  // 让这个对象上的属性 记录当前的acitveEffect
  if (activeEffect) {
    // 说明用户是在effect中使用的这个数据
    let desMap = targetMap.get(target);

    // 如果没有创建一个映射表
    if (!desMap) {
      targetMap.set(target, (desMap = new Map()));
    }

    // 如果有这个映射表来查找一下有没有这个属性
    let dep = desMap.get(key);
    // 如果没有set集合创建集合
    if (!dep) {
      desMap.set(key, (dep = new Set()));
    }
    // 如果有则看一下set中有没有这个effect
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      // name = new Set(effect)
      // age = new Set(effect)
      dep.add(activeEffect);
      // 我可以通过当前的effect 找到这两个集合中的自己。将其移除掉就可以了
      activeEffect.deps.push(dep);
    }
  }
};

// 触发依赖
export const trigger = function (target, key, newValue, oldValue) {
  // 通过对象找到对应的属性 让这个属性对应的effect重新执行
  const desMap = targetMap.get(target);
  if (!desMap) return;
  const dep = desMap.get(key); // name 或者 age对应的所有effect
  const effects = [...dep];
  // debugger;
  // 运行的是数组 删除的是set
  effects &&
    effects.forEach((effect) => {
      // 正在执行的effect ，不要多次执行
      if (effect !== activeEffect) effect.run();
    });
};

// 在收集的列表中将自己移除掉
function cleanupEffect(effect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    // 找到set，让set移除掉自己
    deps[i].delete(effect);
  }
  effect.deps.lenth = 0; // 清空依赖的列表
}
