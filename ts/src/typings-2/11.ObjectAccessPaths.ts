// 把对象生成一个路径，自动提示
import { RemoveFirst } from "./9.KebabCase";
export type ObjectAccessPaths<
  T extends object,
  S extends string = "",
  K = keyof T //获取第一层的key
> = K extends keyof T
  ? T[K] extends object // 取值看是否是对象，如果是对象 就将key 拼接到结果集中
    ? ObjectAccessPaths<T[K], `${S}.${K & string}`>
    : RemoveFirst<`${S}.${K & string}`, "."> // 最终将最后不是对象的拼接起来即可
  : any;
// type x = ObjectAccessPaths<{ home: 1; welcome: { home: 1 } }>;

function createI18n<Schema extends object>(
  schema: Schema
): (path: ObjectAccessPaths<Schema>) => void {
  return (path) => {};
}
// const i18n: (path: "home.topBar.title" | "home.topBar.welcome" | "home.bottomBar.notes" | "login.username" | "login.password") => void
const i18n = createI18n({
  home: {
    topBar: {
      title: "顶部标题",
      welcome: "欢迎登录",
    },
    bottomBar: {
      notes: "XXX备案，归XXX所有",
    },
  },
  login: {
    username: "用户名",
    password: "密码",
  },
});

i18n("home.topBar.title"); // correct
i18n("home.topBar.welcome"); // correct
i18n("home.bottomBar.notes"); // correct

// i18n("home.login.abc"); // error，不存在的属性
// i18n("home.topBar"); // error，没有到最后一个属性
