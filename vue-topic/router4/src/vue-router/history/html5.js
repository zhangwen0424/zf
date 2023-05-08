// 创建路由记录
export function createWebHistory(base = "") {
  // 1.路由系统最基本的 得包含当前的路径，当前路径下他的状态是什么, 需要提供两个切换路径的方法 push replace
  const historyNavigation = useHistoryStateNavigation(base);

  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location
  );

  const routerHistory = Object.assign({}, historyNavigation, historyListeners);

  Object.defineProperty(routerHistory, "location", {
    get: () => historyNavigation.location.value,
  });
  Object.defineProperty(routerHistory, "state", {
    get: () => historyNavigation.state.value,
  });

  return routerHistory;
}

// 前进后退的时候 要更新historyState 和 currentLocation这两个边路
function useHistoryListeners(base, historyState, currentLocation) {
  let listeners = [];
  // 最新的状态，已经前进后退完毕后的状态
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base);
    const from = currentLocation.value;
    const fromState = historyState.value;

    currentLocation.value = to;
    historyState.value = state;
    let isBack = state.position - fromState.position < 0;
    listeners.forEach((listener) => {
      listener(to, from, { isBack });
    });
  };

  // 只能监听浏览器的前进后退
  window.addEventListener("popstate", popStateHandler);

  function listen(cb) {
    listeners.push(cb);
  }

  return { listen };
}

// 路由系统，base,hash模式时候使用
function useHistoryStateNavigation(base) {
  // window.history: {length:1,scrollRestoration:"auto",state:null, prototype:{pushState,replaceState,state,go,back,forward}}
  // window.history.state {back:null, current:'', forward:null, position:0, replace:true, scroll:null}

  // 当前位置信息
  const currentLocation = {
    value: createCurrentLocation(base),
  };
  // 当前路径的状态
  const historyState = {
    value: window.history.state,
  };
  // console.log("window.history", window.history.state);

  // 第一次刷新页面 此时没有任何状态，那么我就自己维护一个状态
  if (!historyState.value) {
    changeLocation(
      currentLocation.value,
      buildState(null, currentLocation.value, null, true),
      true
    );
  }

  //（后退后是哪个路径、当前路径是哪个、要去哪里，我是用的push跳转还是replace跳转，跳转后滚动条位置是哪）
  function changeLocation(to, state, replace) {
    const hasPos = base.indexOf("#");
    const url = hasPos > -1 ? base + to : to;
    window.history[replace ? "replaceState" : "pushState"](state, null, url);
    historyState.value = state; // 将自己生成的状态同步到了 路由系统中了
  }

  // 去哪，带的新的状态是谁？
  function push(to, data) {
    // 跳转的时候 我需要做两个状态 一个是跳转前 从哪去哪， 跳转后 从这到了那

    // 跳转前
    const currentState = Object.assign(
      {},
      historyState.value, // 当前的状态
      {
        forward: to,
        scroll: { left: window.pageXOffset, top: window.pageYOffset },
      }
    );
    // 本质是没有跳转的 只是更新了状态，后续在vue中我可以详细监控到状态的变化
    changeLocation(currentState.current, currentState, true);

    // 跳转后 从这到了那
    const state = Object.assign(
      {},
      buildState(currentLocation.value, to, null),
      { position: currentState.position + 1 },
      data
    );
    changeLocation(to, state, false); // 真正的更改路径
    currentLocation.value = to;
  }

  function replace(to, data) {
    const state = Object.assign(
      {},
      buildState(historyState.value.back, to, historyState.value.forward, true)
    );
    changeLocation(to, state, true);
    currentLocation.value = to; // 替换后需要将路径变为现在的路径
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace,
  };
}

// 自己实现一个路由核心模块
function buildState(
  back,
  current,
  forward,
  replace = false,
  computedScroll = false
) {
  return {
    back,
    current,
    forward,
    replace,
    scroll: computedScroll
      ? { left: window.pathXOffset, top: window.pageYOffset }
      : null,
    position: window.history.length - 1,
  };
}

// 返回当前位置信息
function createCurrentLocation(base) {
  const { pathname, search, hash } = window.location;

  const hasPos = base.indexOf("#"); // 就是hash  / /about ->  #/ #/about
  if (hasPos > -1) {
    return base.slice(1) || "/";
  }

  return pathname + search + hash;
}
