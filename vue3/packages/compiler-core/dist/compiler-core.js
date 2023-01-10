// packages/compiler-core/src/parser.ts
function createParserContext(template) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: template,
    originalSource: template
  };
}
function isEnd(context) {
  const source = context.source;
  return !source;
}
function getSelection(context, start, end) {
  end = getCursor(context);
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset)
  };
}
function getCursor(context) {
  let { line, column, offset } = context;
  return { line, column, offset };
}
function advancePositionWithMutation(context, source, endIndex) {
  let linesCount = 0;
  let linePos = -1;
  for (let i = 0; i < endIndex; i++) {
    if (source[i].charCodeAt(0) === 10) {
      linesCount++;
      linePos = i;
    }
  }
  console.log(linesCount, linePos);
  context.line += linesCount;
  context.offset += endIndex;
  context.column = linePos == -1 ? context.column + endIndex : endIndex - linePos;
}
function advanceBy(context, endIndex) {
  let source = context.source;
  advancePositionWithMutation(context, source, endIndex);
  context.source = source.slice(endIndex);
}
function advanceBySpaces(context) {
  return "";
}
function parseTextData(context, endIndex) {
  const content = context.source.slice(0, endIndex);
  advanceBy(context, endIndex);
  return content;
}
function parseText(context) {
  let endTokens = ["<", "{{"];
  let endIndex = context.source.length;
  let start = getCursor(context);
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1);
    if (index > -1 && index < endIndex) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: 2 /* TEXT */,
    content,
    loc: getSelection(context, start)
  };
}
function parserInterpolation(context) {
  const start = getCursor(context);
  const clonseIndex = context.source.indexOf("}}", 2);
  advanceBy(context, 2);
  const innerStart = getCursor(context);
  const rawContentEndIndex = clonseIndex - 2;
  const preTrimContent = parseTextData(context, rawContentEndIndex);
  const innerEnd = getCursor(context);
  const content = preTrimContent.trim();
  advanceBy(context, 2);
  return {
    type: 5 /* INTERPOLATION */,
    content: {
      type: 4 /* SIMPLE_EXPRESSION */,
      isStatic: false,
      content,
      loc: getSelection(context, innerStart, innerEnd)
    },
    loc: getSelection(context, start)
  };
}
function parserTag(context) {
  const start = getCursor(context);
  const match = /^<\/?([a-z][^ \t\r\n/>]*)/.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBySpaces(context);
}
function parseChilren(context) {
  const nodes = [];
  while (!isEnd(context)) {
    const s = context.source;
    let node;
    if (s[0] === "<") {
      node = parserTag(context);
    } else if (s.startsWith("{{")) {
      node = parserInterpolation(context);
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
    break;
  }
  return nodes;
}
function parser(template) {
  const context = createParserContext(template);
  return parseChilren(context);
}

// packages/compiler-core/src/index.ts
function compile(template) {
  return parser(template);
}
export {
  compile
};
//# sourceMappingURL=compiler-core.js.map
