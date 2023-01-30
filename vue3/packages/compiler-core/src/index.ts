import { isString } from "@vue/shared";
import { PatchFlags } from "packages/shared/src/patchFlags";
import { NodeTypes } from "./ast";
import { parser } from "./parser";
import {
  createCallExpression,
  createObjectExpression,
  createVNodeCall,
  CREATE_ELEMENT_BLOCK,
  CREATE_ELEMENT_VNODE,
  CREATE_TEXT,
  FRAGMENT,
  helpNameMap,
  OPEN_BLOCK,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

// 转化表达式
function transformExpression(node, context) {
  if (node.type === NodeTypes.INTERPOLATION) {
    // console.log("表达式处理", node, context, "----");
    node.content.content = `_ctx.${node.content.content}`;
  }
}

// 转换元素
function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    // console.log("表达式元素进入", node.tag, context, "----");
    return () => {
      // 退出函数
      // 属性处理
      const properties = [];
      const props = node.props;
      for (let i = 0; i < props.length; i++) {
        let { name, value } = props[i];
        properties.push({ key: name, value: value.content });
      }
      const vnodeProps =
        properties.length > 0 ? createObjectExpression(properties) : null;

      // 标签处理
      const vnodeTag = JSON.stringify(node.tag); // 给标签加“”

      // 儿子可能是 一个节点， 或者是多个
      let vnodeChildren = null;
      if (node.children.length === 1) {
        vnodeChildren = node.children[0];
      } else {
        if (node.children.length > 1) {
          vnodeChildren = node.children;
        }
      }

      return (node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      ));
    };
  }
}

function isText(node) {
  // 是表达式或者文本
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT;
}

// 转化文本
function transformText(node, context) {
  if (node.type === NodeTypes.ROOT || node.type === NodeTypes.ELEMENT) {
    return () => {
      // 对于文本来说 主要是根据文本的特性来生成 createTextVnode(内容,标示位)
      // 将多个文本元素合并成一个 {{abc}} hello  ->  createTextVnode(proxy.abc + 'hello')

      // console.log("文本转换", node, context, "----");
      // 默认看第一个元素是不是文本，如果是在尝试看下一个元素是不是文本，如果不是就不拼接了
      let hasText = false;
      const children = node.children; // 先获取所有儿子
      let currentContainer;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (isText(child)) {
          // 是文本
          hasText = true;
          for (let j = i + 1; j < children.length; j++) {
            const nextNode = children[j];
            if (isText(nextNode)) {
              // 要将两个节点合并在一起
              if (!currentContainer) {
                // 用第一个节点作为拼接的节点，将下一个节点拼接上去即可
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION, // 组合表达式
                  children: [child],
                };
              }
              currentContainer.children.push(`+`, nextNode);
              children.splice(j, 1); // 删除儿子的当前项，并且，防止塌陷需要--
              j--;
            } else {
              currentContainer = null;
              break; // 遇到了元素的时候 需要跳出，再找下一个个元素
            }
          }
        }
      }

      // <div>hello</div>
      if (!hasText || children.length == 1) {
        // 元素里面都是元素，没有处理文本 直接跳过就可以了
        return;
      }
      // 对于文本我们需要采用createTextVNode 来进行方法生成
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // 当前是文本或者是合并后的
        if (isText(child) || child.type == NodeTypes.COMPOUND_EXPRESSION) {
          const callArgs = [];
          callArgs.push(child);

          // 如果不是文本，添加文本标识
          if (child.type != NodeTypes.TEXT) {
            callArgs.push(PatchFlags.TEXT + "");
          }

          // 将此元素 进行处理 处理成 createTextVnode的格式
          children[i] = {
            // type是ast的标识
            type: NodeTypes.TEXT_CALL, // 生成文本调用
            content: child,
            // 生成代码 在transform中会生成一些额外的信息，是用于代码生成ed
            codegenNode: createCallExpression(context, callArgs),
          };
        }
      }
      console.log(children);
    };
  }
}

//创建转化的上下文
function createTransformContext(root) {
  // <div>1123 <span>></div><
  const context = {
    currentNode: root,
    parent: null,
    // vue3 早期没有优化的时候 可以用set来去重   计数功能  {createVnode:5}
    helpers: new Map(), // 用于存储用到的方法
    helper(name) {
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name, count + 1);
      return name;
    },
    removeHelper(name) {
      const count = context.helpers.get(name);
      const currentCount = count - 1;
      if (!currentCount) {
        context.helpers.delete(name);
      } else {
        context.helpers.set(name, currentCount);
      }
    },
    nodeTransform: [
      // 节点转换，稍后我会遍历树，拿到节点调用这些转化方法进行转换
      transformExpression, // 转换表达式
      transformElement, // 转换元素
      transformText, // 转换文本
    ],
  };

  return context;
}

// vue2 中转化 只做了标记， vue3中patchFlags, block的处理
function traverseNode(node, context) {
  context.currentNode = node;
  const transforms = context.nodeTransform; // 获取所有的转化方法
  let exitsFns = []; //退出函数
  for (let i = 0; i < transforms.length; i++) {
    let exitFn = transforms[i](node, context); // 循环执行转换方法
    if (exitFn) {
      exitsFns.push(exitFn); // 最外层
    }
  }
  // 遍历儿子，执行儿子
  switch (node.type) {
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node;
        traverseNode(node.children[i], context);
      }
      break;
    case NodeTypes.INTERPOLATION: //表达式
      context.helper(TO_DISPLAY_STRING);
      break;
  }
  // 整个儿子执行完毕后, 依次调用退出函数
  let len = exitsFns.length;
  context.currentNode = node;
  while (len--) {
    exitsFns[len](); //  保证退出函数中拿到的currentNode是正确的，我们还要将其还原回去
  }
}

function createRootCodegen(root, context) {
  const { children } = root;

  if (children.length == 1) {
    const child = children[0];
    if (child.type == NodeTypes.ELEMENT) {
      root.codegenNode = child.codegenNode; // 如果是元素 则直接用元素就可以了
      context.removeHelper(CREATE_ELEMENT_VNODE);
      context.helper(OPEN_BLOCK);
      context.helper(CREATE_ELEMENT_BLOCK);
      root.codegenNode.isBlock = true; // 标记为block节点
      // createElementVnode / createElmenetBlock
    } else {
      root.codegenNode = child;
    }
  } else {
    context.helper(OPEN_BLOCK);
    context.helper(CREATE_ELEMENT_BLOCK);

    root.codegenNode = createVNodeCall(
      context,
      context.helper(FRAGMENT),
      null,
      children
    );
    root.codegenNode.isBlock = true;
  }
}

// 对ast语法树进行转化  给ast节点是增加一些额外的信息  codegenNode, 收集需要导入的方法
export function transform(root) {
  // 可以将一直使用的东西 通过上下文存储、 co的源码， 遍历树
  const context = createTransformContext(root); //创建转化的上下文
  // dom树遍历 只能采用深度遍历
  traverseNode(root, context);
  createRootCodegen(root, context);
  root.helpers = [...context.helpers.keys()];
}

function createCodegenContext() {
  const context = {
    helper: (type) => "_" + helpNameMap[type],
    code: ``, // 存储拼接后的代码
    push(code) {
      context.code += code; // 拼接字符串
    },
    level: 0, // 缩进个数
    indent() {
      // 缩进
      context.newline(++context.level);
    },
    deindent(needNewline = false) {
      // 是否换行向内缩进，还是直接缩进
      if (!needNewline) {
        --context.level;
      } else {
        context.newline(--context.level);
      }
    },
    newline(level = context.level) {
      // 换行
      context.push(`\n` + `  `.repeat(level));
    },
  };
  return context;
}

function genFunctionPreamble(ast, context) {
  // 放导入
  if (ast.helpers && ast.helpers.length > 0) {
    context.push(
      `import {${ast.helpers
        .map((helper) => `${helpNameMap[helper]} as _${helpNameMap[helper]}`)
        .join(",")}} from "vue"`
    );
    context.newline();
  }
}

// 生成文本代码
function genText(node, context) {
  context.push(JSON.stringify(node.content));
}

// 生成表达式代码
function genInterpolation(node, context) {
  // 我们的 INTERPOLATION 》 SIMPLE_EXPRESSION
  // context.push(`_${helpNameMap[TO_DISPLAY_STRING]}(`);
  context.push(`_${context.helper(TO_DISPLAY_STRING)}(`); // 拼下划线
  genNode(node.content, context);
  context.push(`)`);
}

// 生成表达式
function genExpression(node, context) {
  context.push(node.content);
}

function genList(list, context) {
  // createElement('tag',{},)
  for (let i = 0; i < list.length; i++) {
    let node = list[i];
    if (isString(node)) {
      context.push(node);
    } else if (Array.isArray(node)) {
      // 多个孩子
      genList(node, context);
    } else {
      // 可能是属性，也有可能是一个儿子
      genNode(node, context);
    }
    if (i < list.length - 1) {
      context.push(",");
    }
  }
}

function genVNodeCall(node, context) {
  // <div a="1" b="2"><span></span></div>
  // import { createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
  // export function render(_ctx, _cache, $props, $setup, $data, $options) {
  //   return (_openBlock(), _createElementBlock("div", {
  //     a: "1",
  //     b: "2"
  //   }, [
  //     _createElementVNode("span")
  //   ]))
  // }
  const { push, helper } = context;
  const { tag, props, children, isBlock } = node;
  if (isBlock) {
    push(`(${helper(OPEN_BLOCK)}(),`);
    push(helper(CREATE_ELEMENT_BLOCK));
  } else {
    push(helper(CREATE_ELEMENT_VNODE));
  }
  push(`(`);
  // 标签 属性 儿子
  let list = [tag, props, children].filter(Boolean);
  if (list.length > 1) {
    genList(
      (children ? [tag, props, children] : [tag, props]).map(
        (item) => item || "null"
      ),
      context
    );
  } else {
    genList([tag], context);
  }
  push(")");
  if (isBlock) {
    push(")");
  }
}

function genObjectExpression(node, context) {
  // [] => {a:1,b:2}
  // (_openBlock(),_createElementBlock("div",{a:"1",b:"2"},))
  const { properties } = node;
  const { push } = context;
  if (!properties) {
    return;
  }
  push("{");
  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i];
    push(key);
    push(":");
    push(JSON.stringify(value));
    // 一直到最后一个属性，拼接一个,
    if (i < properties.length - 1) {
      push(",");
    }
  }
  push("}");
}

function genCallExpression(node, context) {
  debugger;
  context.push(context.helper(CREATE_TEXT));
  context.push("(");
  genList(node.arguments, context);
  context.push(")"); // createTextVnode('123')
}

function genCompoundExpression(node, context) {
  // createTextVnode(aa  +  aa )
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isString(child)) {
      context.push(child, "1"); // +
    } else {
      // 文本  或者表达式
      genNode(child, context);
    }
  }
}

// 生成代码
function genNode(node, context) {
  if (typeof node === "symbol") {
    context.push(context.helper(FRAGMENT));
    return;
  }
  switch (node.type) {
    case NodeTypes.TEXT: //  文本
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION: // 表达式 {{name}}
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION: // 表达式中的变量
      genExpression(node, context);
      break;
    // 生成元素
    case NodeTypes.VNODE_CALL: //标签
      genVNodeCall(node, context);
      break;
    case NodeTypes.JS_OBJECT_EXPRESSION: // 标签属性
      genObjectExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      // 根据元素我们之前生成 codegenNode来继续生成
      genNode(node.codegenNode, context);
      break;
    case NodeTypes.TEXT_CALL: // 文本中要生成createTextVnode
      genNode(node.codegenNode, context);
      break;
    case NodeTypes.JS_CALL_EXPRESSION: // 文本生成
      genCallExpression(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    // case  NodeTypes.
  }
}

// 代码生成
function generate(ast) {
  const context = createCodegenContext(); // 1.生成代码操作(换行、缩进)的上下文
  genFunctionPreamble(ast, context); // 2.放导入,生成 imprt 语句
  context
    .push
    // 3. ort function (_ctx, _cache, $props, $setup, $data, $options){`
    ();
  context.indent();
  context.push(`return `); // return
  if (ast.codegenNode) {
    // 如果有codegen，用codegen
    genNode(ast.codegenNode, context); // 4. 生成节点
  } else {
    context.push(null); // 如果没有节点则直接null
  }
  context.deindent(true);
  context.push(`}`);
  return context.code;
}

// 把模版转化为语法ast树
export function compile(template) {
  const ast = parser(template); // 1） 对模板的ast生产
  // console.log("ast:", ast);
  transform(ast); // 对ast语法树进行转化  给ast节点是增加一些额外的信息  codegenNode, 收集需要导入的方法
  // 代码生成
  return generate(ast);
}
