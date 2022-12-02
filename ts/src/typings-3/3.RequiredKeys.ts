// 筛选必填属性
import { OptionalKeys } from "./1.OptionalKeys";

type a1 = RequiredKeys<{
  foo: number | undefined;
  bar?: string;
  flag: boolean;
}>; // foo|flag
type a2 = RequiredKeys<{ foo: number; bar?: string }>; // foo
type a3 = RequiredKeys<{ foo: number; flag: boolean }>; // foo|flag
type a4 = RequiredKeys<{ foo?: number; flag?: boolean }>; // never
type a5 = RequiredKeys<{}>; // never

export type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;
