let express = require("express");
let app = express();

app.get("/say", function (req, res) {
  let { wd, cb } = req.query;
  console.log(wd);
  res.end(`${cb}('后端返回参数')`);
});

app.listen(3000);
