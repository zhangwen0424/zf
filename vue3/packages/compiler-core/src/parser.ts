import { NodeTypes } from "./ast";

// 创建行列上下文，存储行列号、模版内容
function createParserContext(template) {
  return {
    line: 1, //行号
    column: 1, // 列号
    offset: 0, // 偏移量
    source: template, // 会不停地被截取 直到字符串为空的时候
    originalSource: template, // 原始内容
  };
}

// 循环遍历模板的终止条件，如果为空说明遍历完毕
function isEnd(context) {
  const source = context.source;
  return !source; // 最终截取到空字符串，停止截取
}

// 计算代码位置
function getSelection(context, start, end?) {
  end = getCursor(context);
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset),
  };
}

// 获取当前游标
function getCursor(context) {
  let { line, column, offset } = context;
  return { line, column, offset };
}

// 处理换行游标
function advancePositionWithMutation(context, source, endIndex) {
  let linesCount = 0; // 计算经过多少行  \n
  let linePos = -1; // 遇到换行标记换行的开始位置
  // 根据结束索引遍历内容，看一下经历了多少个\n字符
  for (let i = 0; i < endIndex; i++) {
    if (source[i].charCodeAt(0) === 10) {
      // 就是换行
      linesCount++;
      linePos = i;
    }
  }
  console.log(linesCount, linePos);
  context.line += linesCount;
  context.offset += endIndex;
  context.column =
    linePos == -1 ? context.column + endIndex : endIndex - linePos;
}

// 前进一步，删除已经解析的内容，前进是删除解析
function advanceBy(context, endIndex) {
  let source = context.source;
  advancePositionWithMutation(context, source, endIndex); //记录行号
  // 删除解析后的内容
  context.source = source.slice(endIndex);
}

// 前进，删除空格
function advanceBySpaces(context) {
  return "";
}

// 截取文本内容
function parseTextData(context, endIndex) {
  const content = context.source.slice(0, endIndex);
  // 截取后需要将context.source中的内容删除掉，删除已经解析的内容
  advanceBy(context, endIndex);
  return content;
}

// 处理文本
function parseText(context) {
  // 如何计算文本的结束位置
  // 假设法求末尾的索引，得到距离自己最近的 < 或者 {{ 就结束嘞
  let endTokens = ["<", "{{"]; // 文本结束的语法
  let endIndex = context.source.length; // 默认末尾是是最后一位
  let start = getCursor(context);

  for (let i = 0; i < endTokens.length; i++) {
    // 因为开头肯定是文本，所以第一个字符肯定不是 < {{, 从下一个开始查找
    const index = context.source.indexOf(endTokens[i], 1);
    // 找到最近结束的位置
    if (index > -1 && index < endIndex) {
      // 没到结尾就遇到了 {{  <
      endIndex = index; // 用最近的作为 我们的结尾
    }
  }
  // context 是当前正在解析的内容，所以不用考虑startIndex
  const content = parseTextData(context, endIndex); //截取文本内容
  return {
    type: NodeTypes.TEXT, // 类型：文本
    content, // 文本内容
    loc: getSelection(context, start), // 计算代码开始结束位置，报错位置
  };
}

// 处理表达式{{}}, 先去掉前面{{，再去掉后面}}，拿到文本
function parserInterpolation(context) {
  const start = getCursor(context); // 表达式的开始信息
  const clonseIndex = context.source.indexOf("}}", 2); // 获取大括号的结束位置

  advanceBy(context, 2); // 删除嘞 {{  自动更新行列信息

  const innerStart = getCursor(context); // 表达式内部开始的位置
  const rawContentEndIndex = clonseIndex - 2; // 获取原始用户大括号中的内容长度

  // 获取去空格是之前的内容
  const preTrimContent = parseTextData(context, rawContentEndIndex);
  const innerEnd = getCursor(context);
  const content = preTrimContent.trim(); // 去掉内容的空格

  advanceBy(context, 2); // 去掉 }}

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content, // 内容 **
      loc: getSelection(context, innerStart, innerEnd), // 有点小bug
    },
    loc: getSelection(context, start),
  };
}

// 处理元素
function parserElement(context) {
  // let node =
}

// 处理标签
function parserTag(context) {
  const start = getCursor(context);
  // match 1) 匹配出来的是完整的字符串  <div></div>  match[0] = <div
  // 2) 第一个分组
  const match = /^<\/?([a-z][^ \t\r\n/>]*)/.exec(context.source);
  const tag = match[1]; //'div'
  advanceBy(context, match[0].length); // <div
  advanceBySpaces(context);

  //
}

// 解析上下文
function parseChilren(context) {
  const nodes = [];
  while (!isEnd(context)) {
    const s = context.source; // 获取当前的内容
    let node; // 当前处理的节点
    if (s[0] === "<") {
      node = parserTag(context);
    } else if (s.startsWith("{{")) {
      // 我们可以对表达式进行处理
      node = parserInterpolation(context);
    }
    if (!node) {
      // 这个东西就是文本
      node = parseText(context);
    }
    nodes.push(node);
    break;
  }
  // context 是当前正在解析的内容，所以不用考虑startIndex
  return nodes;
}

// 解析字符串
export function parser(template) {
  // 解析的时候 解析一点删除一点,解析的终止条件是模板的内容最终为空
  // 状态机 , 有限状态机。找到每一个字符串进行处理
  const context = createParserContext(template);

  return parseChilren(context); // 返回上下文内容
}
