// 把不是函数的属性过滤掉，是函数的有 promise 则进行拆包
interface Module {
  count: number;
  message: string;
  asyncMethod<T, U>(input: Promise<T>): Promise<Action<U>>;
  syncMethod<T, U>(action: Action<T>): Action<U>;
}
interface Action<T> {
  payload?: T;
  type: string;
}

// 实现类型Connect，要求 Connect<Module> 的结果为上面的 Result
// 只要函数类型的属性；
// 如果函数是异步函数，要求自动解析出来Promise中的类型；

type F = Connect<Module>;

// 这个要求的结果
type Result = {
  asyncMethod<T, U>(input: T): Action<U>;
  syncMethod<T, U>(action: T): Action<U>;
};
export type Connect<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any
    ? K
    : never]: T[K] extends <T, U>(input: Promise<T>) => Promise<Action<U>>
    ? <T, U>(input: T) => Action<U>
    : T[K] extends <T, U>(action: Action<T>) => Action<U>
    ? <T, U>(action: T) => Action<U>
    : never;
};
