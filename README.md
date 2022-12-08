# 笔记问题总结

## reactive

- reactive 只能传入对象，非对象不能代理

  - `reactive(123)`
  - 调用 reactive 函数时通过 isObject 判断是否为对象，不是对象不处理

- 同一个对象，二次调用 reactive

  - `reactive(obj); reactive(obj)`
  - 当天 target 存 WekMap 中，调用 reactive 时判断是否代理过，代理过直接返回，没代理则设置代理并缓存代理结果

- 代理过的对象再次传入 reactive，如何处理（去重）

  - 通过对 target 标识 IS_REACTIVE，如果被代理过，在 reactive 中访问 `target['IS_REACTIVE']`会命中 get 方法，在 get 方法中判断访问改标识时证明被代理过，不在代理

- proxy 中的 get 和 set 方法中为什么使用 Reflect（反射）
  - 让操作对象都变为函数式编程，解决 this 问题，类式 call
  - es6 语法，Reflect 提供了一套用于操作对象的 API，统一了操作方式
  - Reflect 对象一共有 13 个静态方法。
    - Reflect.apply(target, thisArg, args)
    - Reflect.construct(target, args)
    - Reflect.get(target, name, receiver)
    - Reflect.set(target, name, value, receiver)
    - Reflect.defineProperty(target, name, desc)
    - Reflect.deleteProperty(target, name)
    - Reflect.has(target, name)
    - Reflect.ownKeys(target)
    - Reflect.isExtensible(target)
    - Reflect.preventExtensions(target)
    - Reflect.getOwnPropertyDescriptor(target, name)
    - Reflect.getPrototypeOf(target)
    - Reflect.setPrototypeOf(target, prototype)

## effect

- effect 涉及的属性方法有哪些

  - ```
    effect(() => {
        app.innerHTML = state.name + state.age;
        effect(() => {
          app.innerHTML = state.name;
        });
        app.innerHTML = state.address;// 最近一次 effect 执行完之后会清理 activeEffect，导致这里取 state 值触发getter 时进行依赖收集时取不到 address字段的activeEffect
    });
    ```

  - run 回调函数，记录 effect 传入的函数

  - activeEffect，当前执行的 effect 函数，用于收集依赖

  - parent 存父亲依赖，effect 调用完毕后会清理掉 activeEffect，在嵌套 effect 执行完毕后，无法获取到当前的 effect，所以做个备份，上个 effect 执行完毕后，把 activeEffect 指向 parent，清理 parent，

    - name,age -->[e1]
    - name -->[e1,e2]-->[e1]
    - address-->[e1]

  - deps 存放 effect 列表， 依赖收集， 属性--》多个 effect, effect--》多个属性

  - track 依赖收集

    // weakmap : map : set
    // {name:'mornki'}:'name' -> [effect,effect]
    // :'age' -> [effect]

    - 如果存在 activeEffect 时，看有没有当前 target 对象的映射 desMap `let desMap = targetMap.get(target);`, 没有则创建 target 映射 targetMap `targetMap.set(target, (desMap = new Map()));`
    - 看 target 映射中这个属性有没有收集过 `let dep = desMap.get(key);`，没有收集则创建 dep `desMap.set(key, (dep = new Set())); `
    - 看该属性有没有收集过 这个 activeEffect , 没有则增加 `dep.add(activeEffect);`
    - 同时增加到依赖列表中`activeEffect.deps.push(dep);`

  - trigger 依赖触发

    - 从 targetMap 中看有没有 target `const desMap = targetMap.get(target);`，有则找有没有该属性对性的 effect `const dep = desMap.get(key);`
    - 循环运行属性涉及的所有的 effect
      ```
        const effects = [...dep];
        effects &&
          effects.forEach((effect) => {
            // 正在执行的effect ，不要多次执行
            if (effect !== activeEffect) effect.run();
          });
      ```

  - cleanupEffect 清理依赖

            - ```
              effect(() => {
                  // flag 和 name属性会触发收集
                  // 下一次应该清理掉flag和name属性。 重新收集flag 和 age属性
                  console.log("runner");
                  app.innerHTML = state.flag ? state.name : state.age;
                });
              setTimeout(() => {
                state.flag = false;
                setTimeout(() => {
                  console.log("修改了 name，这时候不需要触发 name的 effect");
                  state.name = "xxx";
                });
              }, 1000);

              ```

            - 在 run 方法调用中调用`cleanupEffect(effect)`
            - 每次收集依赖之前，清理掉之前收集的依赖
              - effect 中的 deps 存入哪些属性依赖了该 activeEffect
              - 通过 deps 找到属性，把属性依赖的 effect 清理掉
              - effect 中deps 依赖列表置空重新收集
              -
              ```
              function cleanupEffect(effect) {
                const { deps } = effect;
                for (let i = 0; i < deps.length; i++) {
                  // 找到 set，让 set 移除掉自己
                  deps[i].delete(effect);
                }
                effect.deps.lenth = 0; // 清空依赖的列表
              }
              ```
