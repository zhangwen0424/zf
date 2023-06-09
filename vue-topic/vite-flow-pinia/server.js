const express = require("express");

const app = express();

app.post("/login", (req, res) => {
  res.send({
    code: 0,
    data: { username: "zw", token: "server token" }
  });
});
app.listen(3000);
