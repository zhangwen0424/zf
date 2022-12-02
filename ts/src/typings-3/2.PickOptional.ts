// 筛选可选属性
import { OptionalKeys } from "./1.OptionalKeys";

type a1 = PickOptional<{
  foo: number | undefined;
  bar?: string;
  flag: boolean;
}>; // {bar?:string|undefined}  tsconfig.json中 "strictNullChecks": false，就没有 undefined 了
type a2 = PickOptional<{ foo: number; bar?: string }>; // {bar?:string}
type a3 = PickOptional<{ foo: number; flag: boolean }>; // {}
type a4 = PickOptional<{ foo?: number; flag?: boolean }>; // {foo?:number,flag?:boolean}
type a5 = PickOptional<{}>;

export type PickOptional<T> = Pick<T, OptionalKeys<T>>;
