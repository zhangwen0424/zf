import express from 'express'
import cors from 'cors'
const app = express();
app.use(cors());

// 轮询，短轮询（设置一个时间来询问你获取最新的信息）

app.get('/clock',function(req,res){
    // 如果有新的数据了 在响应给服务器
    res.send(new Date().toLocaleString())
});


app.listen(3000,function(){
    console.log('server start 3000')
})

