const fs = require("fs");
const path = require("path");

fs.readFile(
  path.resolve(__dirname, "fileUrl.txt"),
  "utf8",
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    fs.readFile(path.resolve(__dirname, data), "utf8", function (err, data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });
  }
);

// fileUrl.txt -> name.txt -> 最终的结果
