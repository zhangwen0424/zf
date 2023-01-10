import { parser } from "./parser";

// 把模版转化为语法ast树
export function compile(template) {
  return parser(template);
}
