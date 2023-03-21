let express = require("express");
let app = express();
// 把当前文件夹当做可访问的静态目录
app.use(express.static(__dirname));
app.listen(4000);
