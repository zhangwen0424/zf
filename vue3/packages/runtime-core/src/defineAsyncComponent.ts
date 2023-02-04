// 高阶函数，最终我们要返回一个组件

import { Fragment, h, ref } from ".";

export const defineAsyncComponent = ({ loader, ...options }) => {
  return {
    setup() {
      const loaded = ref(false);
      const loading = ref(false);
      const error = ref(false);
      let attempts = ref(0); //重试次数

      // 错误处理
      let errorTimer;
      if (options.timeout) {
        errorTimer = setTimeout(() => {
          error.value = true; // 已经到了超时时间，表示显示错误了
        }, options.timeout);
      }
      // 延迟加载
      let timer;
      if (options.delay) {
        timer = setTimeout(() => {
          loading.value = true; // 正在加载中应该显示loading文字
        }, options.delay || 200);
      } else {
        loading.value = true;
      }

      let InteralComp; //组件
      //   (load().catch().load().catch()).then().finally()
      function load() {
        return loader().catch((err) => {
          // 如果失败了 ， 我们需要重新尝试
          // 失败以后，要等待尝试的结果， 看一下尝试的结果是成功还是失败
          if (options.onError) {
            return new Promise((resolve, reject) => {
              const retry = () => {
                resolve(load());
              };
              const fail = () => {
                reject(err);
              };
              options.onError(err, retry, fail, ++attempts.value);
            });
          } else {
            throw err;
          }
        });
      }

      load()
        .then((comp) => {
          // promise已经加载完成
          loaded.value = true;
          error.value = false; // 加载成功了 就不在失败了
          InteralComp = comp;
        })
        .catch((err) => {
          error.value = true;
        })
        .finally(() => {
          // 只要成功或者失败都会执行
          loading.value = false;
        });

      return () => {
        // 此方法会被多次调用
        if (error.value) {
          return h(options.errorComponent);
        } else if (loading.value) {
          return h(options.loadingComponent, { attempts });
        } else if (loaded.value) {
          return h(InteralComp);
        } else {
          return h(Fragment, []);
        }
      };
    },
  };
};

// 在路由切换到某个页面之后，此时我希望增加loading

// function withLoading(loader){
//     return defineAsyncComponent({
//         loader
//         loadingComponent:{}
//     })
// }

// {
//     component: withLoading(()=> import('xxxx'))
// }
