<script setup>
import { useCounterStore1 } from "./stores/counter1";
import { useCounterStore2 } from "./stores/counter2";
const store1 = useCounterStore1();
const { increment } = useCounterStore1();
const handleClick1 = () => {
  // 直接调用
  // increment(2);

  // 这里是三次更新， 合并成一次更新用  store1.$patch(对象|函数), 类似 setState
  // store1.count++;
  // store1.count++;
  // store1.count++;
  // 对象形式
  // store1.$patch({ count: 1000 });
  // 函数形式
  // store1.$patch((state) => {
  //   state.count = 1000;
  // });

  // 将状态全部更新
  store1.$state = { count: 1090 };
};
const handleReset1 = () => {
  store1.$reset(); // 重置状态
};
// 卸载
const handleDispose = () => {
  store1.$dispose(); // scope.run 是收集 effect 的，scope.stop 是停止effect
};
const handelDisposeAll = () => {
  // store1._p._e.stop();// 可以终止所有，但是未提供出来，不建议使用
};

const store2 = useCounterStore2();
const handleClick2 = () => {
  store2.increment(3);
};
// 订阅消息，监听的状态变化
store2.$subscribe((storeInfo, state) => {
  console.log(storeInfo, state);
});
// 监听方法调用
store2.$onAction(({ after, onError }) => {
  console.log("action running", store2.count); // 修改前状态
  after(() => {
    console.log("action after", store2.count); //修改后的状态
  });
  onError((err) => {
    console.log("err", err);
  });
});
</script>

<template>
  ----------------options-------------- <br />
  {{ store1.count }}
  {{ store1.double }}
  <button @click="handleClick1">修改状态</button>
  <button @click="handleReset1">重置状态</button>
  <button @click="handleDispose">卸载响应式</button>
  <hr />

  ----------------setup--------------<br />
  {{ store2.count }}
  {{ store2.double }}
  <button @click="handleClick2">修改状态</button>
</template>

<style scoped></style>
