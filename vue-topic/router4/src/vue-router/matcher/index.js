// 格式化用户的参数
function normalizeRouteRecord(record) {
  return {
    path: record.path, // 状态机 解析路径的分数，算出匹配规则
    meta: record.meta || {},
    beforeEnter: record.beforeEnter,
    name: record.name,
    components: { default: record.component }, // 循环
    children: record.children || [],
  };
}

// 创造匹配记录 ，构建父子关系
function createRouteRecordMatcher(record, parent) {
  const matcher = {
    path: record.path,
    record,
    parent,
    children: [],
  };
  if (parent) {
    parent.children.push(matcher);
  }
  return matcher;
}

// 树的遍历
function createRouterMatcher(routes) {
  const matchers = [];

  // 循环加入路由到树中
  function addRoute(route, parent) {
    // 格式化用户参数
    let normalizedRecord = normalizeRouteRecord(route);

    // 把父亲的路径拼到子路由中
    if (parent) {
      normalizedRecord.path = parent.path + normalizedRecord.path;
    }

    // 构建父子关系
    const matcher = createRouteRecordMatcher(normalizedRecord, parent);
    // 循环路由中的子路由，加入到树中
    if ("children" in normalizedRecord) {
      let children = normalizedRecord.children;
      for (let i = 0; i < children.length; i++) {
        addRoute(children[i], matcher);
      }
    }
    matchers.push(matcher);
  }

  routes.forEach((route) => addRoute(route));
  // console.log("matchers", matchers);

  // 匹配路径， /home/a   matched:[home, a]
  function resolve(location) {
    // {path:/,matched:HomeRecord} {path:/a,matched:[HomeRecord,aRecord]}
    const matched = [];
    let path = location.path;
    let matcher = matchers.find((m) => m.path == path);
    while (matcher) {
      matched.unshift(matcher.record); // 将用户的原始数据 放到matched中
      matcher = matcher.parent;
    }

    return {
      path,
      matched,
    };
  }

  return {
    addRoute, // 动态的添加路由， 面试问路由 如何动态添加 就是这个api
    resolve,
  };
}

export { createRouterMatcher };
