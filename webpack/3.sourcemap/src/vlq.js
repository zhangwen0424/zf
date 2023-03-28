/**
VLQ是Variable-length quantity 的缩写，是一种通用的、使用任意位数的二进制来表示一个任意大的数字的一种编码方式
这种编码需要用最高位表示连续性，如果是1，代表这组字节后面的一组字节也属于同一个数；如果是0，表示该数值到这就结束了
如何对数值137进行VLQ编码
1.将137改写成二进制形式 10001001
2.从右向左七位一组做分组，不足的补在左侧补0
3.最后一组开头补0，其余补1
137的VLQ编码形式为10000001 00001001
 */
let num = 137;
//1.把137变成二进制数
let binary = num.toString(2);
console.log("binary", binary); // 10001001
// 2.从右向左七位一组做分组，不足的补在左侧补0
const totalLength = Math.ceil(binary.length / 7) * 7;
console.log("totalLength", totalLength); // 14
//把字符变成指定的长度，不足的话前面补0
const padded = binary.padStart(totalLength, "0");
console.log("padded", padded); // 0000001 0001001
//最后一组开头补0，其余补1
const groups = padded.match(/\d{7}/g);
console.log("groups", groups); // [ '0000001', '0001001' ]
//最后一组开头补0，其余补1
const lastGroup = groups.pop();
const vlqCode = groups.map((groups) => "1" + groups).join("") + "0" + lastGroup;
console.log("vlqcode", vlqCode); // 10000001 00001001
