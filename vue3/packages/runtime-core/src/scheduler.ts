const queue = [];
let isFlushing = false; //是否正在刷新

const p = Promise.resolve();
export function queueJob(job) {
  // 去重处理
  if (!queue.includes(job)) {
    queue.push(job);
  }
  console.log(queue);
  // 数据变化更 可能会出现多个组件的更新，所有需要采用队列来存储

  // 没有刷新处理
  if (!isFlushing) {
    isFlushing = true; // 组件异步更新流程其实就是通过批处理来实现的

    // p.then为微任务，会等待同步代码执行完知乎在执行回调
    p.then(() => {
      isFlushing = false;
      let copyQueue = queue.slice(0); // 将当前要执行的队列拷贝一份，并且清空队列
      // 执行一轮，将原来的 queue 置空，可以再往老的 queue 里面放
      queue.length = 0;
      copyQueue.forEach((job) => {
        job();
      });
      copyQueue.length = 0;
    });
  }
}
// 浏览器的事件环、一轮一轮的实现
