// 筛选必传字段
import { RequiredKeys } from "./3.RequiredKeys";

type a1 = PickRequired<{
  foo: number | undefined;
  bar?: string;
  flag: boolean;
}>; // {foo:number|undefined,flag:boolean}
type a2 = PickRequired<{ foo: number; bar?: string }>; // {foo:number}
type a3 = PickRequired<{ foo: number; flag: boolean }>; // {foo:number,flag:boolean}
type a4 = PickRequired<{ foo?: number; flag?: boolean }>; // {}
type a5 = PickRequired<{}>; // {}

export type PickRequired<T> = Pick<T, RequiredKeys<T>>;
