import { createStore } from "@/vuex";
// import { createStore } from "vuex";

export default createStore({
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
      setTimeout(() => {
        commit("add", payload);
      }, 1000);
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
