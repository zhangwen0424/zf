import { createStore } from "@/vuex";
// import { createStore } from "vuex";

// 自定义插件，数据持久化插件：1.传入订阅函数，2.数据修改发布消息，3 执行订阅函数，修改 localStorage
function customPlugin(store) {
  let local = localStorage.getItem("VUEX:STATE");
  if (local) {
    store.replaceState(JSON.parse(local));
  }
  // 每当状态发生变化 （调用了mutation的时候 就会执行此回调）
  store.subscribe((mutaton, state) => {
    localStorage.setItem("VUEX:STATE", JSON.stringify(state));
  });
}

const store = createStore({
  plugins: [customPlugin], // 会按照注册的顺序依次执行插件,执行的时候会把store传递给你
  strict: true, //开启严格模式不允许在mutation下该状态
  // 组件中的data
  state: {
    count: 0,
  },
  // 计算属性 vuex4 他并没有实现计算属性的功能
  getters: {
    double(state) {
      return state.count * 2;
    },
  },
  // 可以更改状态 必须是同步更改的
  mutations: {
    add(state, payload) {
      state.count += payload;
    },
  },
  // 可以调用其他action，或者调用mutation
  actions: {
    asyncAdd({ commit }, payload) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit("add", payload);
          resolve();
        }, 2000);
      });
    },
  },
  // 子模块 实现逻辑的拆分
  modules: {
    aCount: {
      namespaced: true,
      state: { count: 0 },
      mutations: {
        add(state, payload) {
          state.count += payload;
        },
      },
      modules: {
        cCount: {
          state: { count: 0 },
          namespaced: true,
          mutations: {
            add(state, payload) {
              state.count += payload;
            },
          },
        },
      },
    },
    bCount: {
      state: { count: 0 },
      namespaced: true,
      mutations: {
        add(state, payload) {
          state.count += payload;
        },
      },
    },
  },
});

// 严格模式
// dispatch(action) => commit(mutation) => 修改状态

// 有一个功能 在a页面需要调用一个接口 影响的可能是a数据    b页面也需要调用同一个接口 改的是b数据

// 注册组件
store.registerModule(["aCount", "cCount"], {
  namespaced: true,
  state: { count: 100 },
  mutations: {
    add(state, payload) {
      state.count += payload;
    },
  },
});
export default store;
