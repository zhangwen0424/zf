// import "./css/index.css";

// let sum = (a, b) => a + b;
// console.log(sum(1, 2));

// import png from "./images/icons/facebook.png";
// console.log("png:", png);
// import jpg from "./images/avatar_M.jpg";
// console.log("jpg:", jpg);
// import txt from "./test.txt";
// console.log("txt:", txt);

// 响应式图片，图片所能裁剪的最大尺寸是图片的尺寸，案例图片要找个大的
// import responsiveImage from "./images/bgg.jpg?sizes[]=300,sizes[]=600,sizes[]=1024";
/* import responsiveImage from "./images/bgg.jpg?responsize";
console.log(responsiveImage);
let img = new Image();
img.srcset = responsiveImage.srcSet;
img.sizes = `(min-width: 1024px) 1024px, 100vw`;
document.body.appendChild(img);

let facebook = new Image();
facebook.src = require("./images/icons/facebook.png");
document.body.appendChild(facebook);

let github = new Image();
github.src = require("./images/icons/github.png");
document.body.appendChild(github);

let twitter = new Image();
twitter.src = require("./images/icons/twitter.png");
document.body.appendChild(twitter); */

// 前置依赖
// const { vendor } = require("./vendor");
import { vendor } from "./vendor";
console.log(vendor);
