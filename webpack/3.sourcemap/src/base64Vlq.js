/**
 * 1. 将137改写成二进制形式  10001001
 * 2. 127是正数，末位补0，负数补0， 100010010
 * 3. 五位一组做分组，不足的前面补0 01000 10010
 * 4. 将组倒序排序 10010 01000
 * 5. 最后一组开头补0，其余补1 110010 001000
 * 6. 转64进制 y和I
 */
var base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function encode(num) {
  //  1. 将137改写成二进制形式  10001001
  let binary = Math.abs(num).toString(2);
  console.log("binary", binary); //10001001

  // 2. 127是正数，末位补0 100010010 (只看最后一位就知道这个数是正数还是负数 相当于是个符号位)
  binary = num > 0 ? binary + "0" : binary + "1";

  //3. 五位一组做分组，不足的补0 01000 10010
  //为什么五位一组，因为我最终想转成base64字符串，而base64字符串对应的索引0-63
  //0~63对应的是6位bit,也就是6个位。我们需要有1位来表示是否连续
  binary = binary.padStart(Math.ceil(binary.length / 5) * 5, "0");
  console.log("binary", binary); //01000 10010
  let parts = [];
  for (let i = 0; i < binary.length; i += 5) {
    parts.push(binary.slice(i, i + 5));
  }
  console.log("parts", parts); // [ '01000', '10010' ]

  //4. 将组倒序排序 如果一个数字是由多个字节组成的话，高位和低位，倒序之后就以成低位在前，高位在后
  parts.reverse();
  // 为什么要倒序？？？
  //第一位的最后一位代表正负,因为正负数原来在最右边，通过反转数组，把最后一部放在第一个位置
  //那么第一个位置 最后一个数字就是正负号

  //5. 最后一组开头补0，其余补1
  //0表示这是最后一个组成部分了,1代表后面那个也是当前数值的一部分，连续位
  for (let i = 0; i < parts.length; i++) {
    if (i === parts.length - 1) {
      parts[i] = "0" + parts[i];
    } else {
      parts[i] = "1" + parts[i];
    }
  }
  console.log("continue", parts); // [ '110010', '001000' ]
  // 6. 转64进制
  let chars = [];
  for (let i = 0; i < parts.length; i++) {
    // parseInt(转换字符串，转换的基数)
    chars.push(base64[parseInt(parts[i], 2)]);
  }
  return chars.join("");
}
console.log(encode(137)); // yI
