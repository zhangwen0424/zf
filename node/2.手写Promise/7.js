let p = new Promise((resolve, reject) => {
  reject(123);
});

p.then((data) => {})
  .then((data) => {})
  .then(null, (err) => {});
