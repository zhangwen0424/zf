计数器： {{ count }} {{ $store.state.count }}
<hr />
double:{{ double }} {{ $store.getters.double }}

<!-- 开启严格模式会报错 -->
<button @click="$store.state.count++">错误修改</button>
&nbsp;

<!-- 同步修改 -->
<button @click="add">同步修改</button>
&nbsp;
<button @click="asyncAdd">异步修改</button>
