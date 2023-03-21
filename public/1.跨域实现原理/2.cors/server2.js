let express = require("express");

let app = express();
let whitList = ["http://localhost:3000"]; //白名单

// 请求拦截
app.use(function (req, res, next) {
  let origin = req.headers.origin;
  console.log("origin", origin);
  if (whitList.includes(origin)) {
    // 设置哪个源可以访问我
    res.setHeader("Access-Control-Allow-Origin", origin);
    // 允许携带哪个头访问我
    res.setHeader("Access-Control-Allow-Headers", "name,age");
    // 允许哪个方法访问我,默认 get 可以访问
    res.setHeader("Access-Control-Allow-Methods", "PUT");
    // 允许携带cookie
    res.setHeader("Access-Control-Allow-Credentials", true);
    // 允许返回的头
    res.setHeader("Access-Control-Expose-Headers", "test");
    // 预检的存活时间, 设置 3s预检一次
    res.setHeader("Access-Control-Max-Age", 0);
    // 预检不做操作
    if (req.method === "OPTIONS") {
      res.end(); // OPTIONS请求不做任何处理
    }
  }
  console.log("req.header:", req.headers, req.headers.cookie);
  next();
});

app.put("/getData", function (req, res) {
  // res.setHeader("name", "1");
  res.end("server2 put请求成功！");
});

app.get("/getData", function (req, res) {
  res.setHeader("test", "ok");
  res.end("server2 get请求成功！");
});
// 把当前文件夹当做可访问的静态目录
app.use(express.static(__dirname));
app.listen(4000);
