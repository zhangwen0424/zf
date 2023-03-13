// webpack 内置 express
const express = require("express");
const app = new express();

// app.get("/api/user", function (req, res) {
app.get("/user", function (req, res) {
  res.json({ name: "zw", age: 18 });
});

app.listen(3000, () => console.log("3000"));
