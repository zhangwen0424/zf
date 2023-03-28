# 跨域

## 同源策略

协议 域名 端口 同域

http://www.zf.cn:8081
https://a.zf.cn:8081

## 为什么浏览器不支持跨域

cookie LocalStorage  
DOM 元素也有同源策略 iframe
ajax 也不支持跨域

## 实现跨域

- jsonp
- cors
- postMessage
- window.name
- location.hash
- http-proxy
- nginx
- websocket
- document.domain

### jsonp

- 只能发送 get 请求 不支持 post put delete
- 不安全 xss 攻击 不采用

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      function jsonp({ url, params, cb }) {
        return new Promise((resolve, reject) => {
          let script = document.createElement("script");
          window[cb] = function (data) {
            resolve(data);
            document.body.removeChild(script);
          };
          params = { ...params, cb }; // wd=b&cb=show
          let arrs = [];
          for (let key in params) {
            arrs.push(`${key}=${params[key]}`);
          }
          script.src = `${url}?${arrs.join("&")}`;
          console.log("script.src ", script.src);
          document.body.appendChild(script);
        });
      }
      jsonp({
        url: "http://localhost:3000/say",
        params: { wd: "前端查询参数" },
        cb: "show", //回调函数
      }).then((data) => {
        console.log("data:", data);
      });
    </script>
  </body>
</html>
```

server.js

```js
let express = require("express");
let app = express();

app.get("/say", function (req, res) {
  let { wd, cb } = req.query;
  console.log(wd);
  res.end(`${cb}('后端返回参数')`);
});

app.listen(3000);
```

### cors

- 开启两个静态文件访问服务，端口号 3000、4000，在 3000 端口中访问 4000 端口服务会跨域

server1.js

```js
let express = require("express");
let app = express();
// 把当前文件夹当做可访问的静态目录
app.use(express.static(__dirname));
app.listen(3000);
```

server2.js

```js
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
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      let xhr = new XMLHttpRequest();
      document.cookie = "user=mornki";
      xhr.open("get", "http://localhost:4000/getData", true); // true支持异步
      xhr.setRequestHeader("name", "zw");
      xhr.setRequestHeader("age", "18");

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            console.log(
              "xhr.response:",
              xhr.response,
              xhr.getResponseHeader("test")
            );
          }
        }
      };
      xhr.send();
    </script>
  </body>
</html>
```

### postMessage

- 开启两个静态文件服务，端口号分别为 3000、4000
- a.html 中嵌入 iframe 访问 4000 端口号，通过 contentWindow.postMessage 向 b.html 发送消息
- b.html 为 iframe 中的通过 source.postMessage 向 a.html 发消息
- a,b 接受消息都通过 window.onmessage 接收消息

a.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <iframe
      src="http://localhost:4000/b.html"
      id="frame"
      frameborder="0"
      onload="load()"
    ></iframe>
    <script>
      function load() {
        let frame = document.getElementById("frame");
        frame.contentWindow.postMessage("您好！", "http://localhost:4000");
        window.onmessage = function (e) {
          console.log("a接收到数据：", e.data, e);
        };
      }
    </script>
  </body>
</html>
```

b.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      window.onmessage = function (e) {
        console.log("b接收到数据：", e.data, e);
        e.source.postMessage("a", e.origin);
      };
    </script>
  </body>
</html>
```

### window.name

- iframe 跨域访问变量会报错，但是可以 src 先指向跨域地址把参数放到 window 上
- 在把 iframe 的 src 指向同域地址，获取时就不会报错

a.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!--  
      a和b是同域的 http://localhost:3000
      c是独立的  http://localhost:4000
      a获取c的数据
      a先引用c c把值放到window.name,把a引用的地址改到b 
    -->
    <iframe
      src="http://localhost:4000/c.html"
      id="frame"
      frameborder="0"
      onload="load()"
    ></iframe>
    <script>
      let first = true;
      function load() {
        let iframe = document.getElementById("frame");
        if (first) {
          iframe.src = "http://localhost:3000/b.html";
          first = false;
        } else {
          // 如果直接获取 c的 name会跨域，但是 b和 a 不跨域可以访问
          console.log(iframe.contentWindow.name);
        }
      }
    </script>
  </body>
</html>
```

b.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body></body>
</html>
```

c.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      window.name = "test";
    </script>
  </body>
</html>
```

### location.hash

- a、b、c 页面关系，a 中嵌入 c，c 中嵌入 b，a 和 c 通信会跨域
- a 通过 iframe 把 hash 值给 c，c 通过 iframe 把 hash 值给 b，b 改变 hash 值，a 监听 hash 的变化得到 c 提供的 hash 值
- 浏览器中 hash 的变化：c（hash）=> b（hash）=>a 监听 hash 变化

a.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!--  
      路径后面的hash值可以用来通信
      a和b是同域的 http://localhost:3000
      c是独立的  http://localhost:4000
      目的a想访问c
      a给c传一个hash值 c收到hash值后  c把hash值传递给b b将结果放到a的hash值中
    -->
    <iframe
      src="http://localhost:4000/c.html#fromAtoC"
      id="frame"
      frameborder="0"
    ></iframe>
    <script>
      // 监控 hash 变化
      window.onhashchange = function () {
        console.log("a:", location.hash);
      };
    </script>
  </body>
</html>
```

b.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      window.parent.parent.location.hash = location.hash;
    </script>
  </body>
</html>
```

c.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      console.log("c", location.hash);
      let iframe = document.createElement("iframe");
      iframe.src = "http://localhost:3000/b.html#fromC";
      document.body.appendChild(iframe);
    </script>
  </body>
</html>
```

### document.domain

通过 window.domain 讲页面指向同一域名

a.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body>
    <!-- 域名 一级域名二级域名 -->
    <!-- www.baidu.com -->
    <!-- viode.baidu.com -->
    <!-- a是通过 http://a.zf1.cn:3000/a.html -->
    helloa
    <iframe
      src="http://b.zf1.cn:3000/b.html"
      frameborder="0"
      onload="load()"
      id="frame"
    ></iframe>
    <script>
      document.domain = "zf1.cn";
      function load() {
        console.log(frame.contentWindow.a);
      }
    </script>
  </body>
</html>
```

b.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body>
    hellob
    <script>
      document.domain = "zf1.cn";
      var a = 100;
    </script>
  </body>
</html>
```

### websocket

server.js

```js
let express = require("express");
let app = express();
let WebSocket = require("ws");
let wss = new WebSocket.Server({ port: 3000 });
wss.on("connection", function (ws) {
  ws.on("message", function (data) {
    console.log("data:", String(data));
    ws.send("server传输的数据！");
  });
});
```

socket.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      // 高级api 不兼容 socket.io(一般使用它)
      let socket = new WebSocket("ws://localhost:3000");
      socket.onopen = function () {
        socket.send("html页面发送的消息");
      };
      socket.onmessage = function (e) {
        console.log("e.data", e.data);
      };
    </script>
  </body>
</html>
```

### nginx

- brew search nginx 查找 nginx 是否安装
- brew install nginx 安装 nginx
- brew info nginx 查找 nginx 安装目录
- nginx -s reload reload 命令会重新加载配置文件，而 nginx 服务不会中断，服务启动，文件即加载成功
  访问 nginx: http://localhost:8080/
- sudo nginx -s stop 关闭 nginx
- sudo nginx -t 查看 nginx 的配置路径, 修改 nginx.conf，添加跨域访问

```conf
    location ~.*\.json {
        root json;
        add_header "Access-Control-Allow-Origin" "*";
    }
```

server.js

```js
let express = require("express");
let app = express();
app.use(express.static(__dirname));
app.listen(3000);
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body>
    <script>
      let xhr = new XMLHttpRequest();
      xhr.open("get", "http://localhost:8080/test.json", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            console.log(xhr.response);
            // console.log(xhr.getResponseHeader("name"));
          }
        }
      };
      xhr.send();
    </script>
  </body>
</html>
```

```conf

#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       8080;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   html;
            index  index.html index.htm;
        }

        location ~.*\.json {
            root json;
            add_header "Access-Control-Allow-Origin" "*";
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
    include servers/*;
}
```

### http-proxy
