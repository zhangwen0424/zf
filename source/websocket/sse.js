import express from 'express'
import cors from 'cors'
const app = express();
app.use(cors());
app.get('/clock',function(req,res){
    res.setHeader('Content-Type','text/event-stream'); // 这里标明服务端传递的是一个事件流
    setInterval(()=>{
        // 和http协议一样 按照行的方式传输 
        // Content-Type: xxxx
        // Authorization: xxx
        res.write(`id:${Math.random()}\nevent:message\ndata:${JSON.stringify({name:"jw",age:30})}\n\n`)
    },1000)
    // 缺点就是单向传输，客户端，无法给服务端传递数据
});


app.listen(3000,function(){
    console.log('server start 3000')
})

