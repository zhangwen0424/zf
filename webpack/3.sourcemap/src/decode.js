var base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decode(str) {
  let parts = str.split("");
  console.log("parts", parts); // [ 'y', 'I', 'A', 'E', 'D', 'F' ]
  let numbers = [];
  let allNumbers = [];
  for (let i = 0; i < parts.length; i++) {
    const index = base64.indexOf(parts[i]);
    // 转化为二进制，不足补0
    const binary = index.toString(2).padStart(6, "0");
    // 去除连续位
    numbers.push(binary.slice(1));
    let isLastSegment = binary[0] === "0";
    // 根据连续位把实际数值放到一起
    if (isLastSegment) {
      allNumbers.push(numbers);
      numbers = [];
    }
  }
  console.log("numbers", numbers, JSON.stringify(allNumbers));
  //allNumbers: [["10010","01000"],["00000"],["00100"],["00011"],["00101"]]
  let result = [];
  for (let i = 0; i < allNumbers.length; i++) {
    let numbers = allNumbers[i];
    let sign;
    let binary = numbers
      .map((number, index) => {
        if (index === 0) {
          sign = number[number.length - 1] == "0" ? 1 : -1;
          return number.slice(0, 4);
        }
        return number; ////否则number就是数值
      })
      .reverse()
      .join("");
    result.push(parseInt(binary, 2) * sign);
  }
  return result;
}
console.log(decode("yIAEDF")); //[ 137, 0, 2, -1, -2 ]

function explain(lines) {
  return lines.split(",").map(decode);
}
let postions = explain("AAAA,IAAIA,EAAE,CAAN,CACIC,EAAE,CADN,CAEIC,EAAE;");
console.log(JSON.stringify(postions));
//后列,哪个源文件,前行,前列,变量
// postions: [[0,0,0,0],[4,0,0,4,0],[2,0,0,2],[1,0,0,-6],[1,0,1,4,1],[2,0,0,2],[1,0,-1,-6],[1,0,2,4,1],[2,0,0,2,0]]
//[item[2],item[3],0,item[0]] 转换前的第几行，第几列，转换后的第几列
// [转换前行，转换前列，转换后行，转换后列]
let offsets = postions.map((item) => [item[2], item[3], 0, item[0]]);
console.log("offsets", JSON.stringify(offsets));
// offsets: [[0,0,0,0],[0,4,0,4],[0,2,0,2],[0,-6,0,1],[1,4,0,1],[0,2,0,2],[-1,-6,0,1],[2,4,0,1],[0,2,0,2]]
let origin;
let target;
let mappings = [];
for (let i = 0; i < offsets.length; i++) {
  const [originRow, originCol, targetRow, targetCol] = offsets[i];
  if (i === 0) {
    //第一个是绝对位置,
    origin = { row: originRow, col: originCol };
    target = { row: targetRow, col: targetCol };
  } else {
    //后面的是相对位置
    origin.row += originRow;
    origin.col += originCol;
    target.row += targetRow;
    target.col += targetCol;
  }
  mappings.push(
    `([${origin.row},${origin.col}](#0)=>[${target.row},${target.col}])`
  );
}
console.log(mappings);
