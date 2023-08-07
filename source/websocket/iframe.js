import express from 'express'
import cors from 'cors'
const app = express();
app.use(cors());

// 轮询，短轮询（设置一个时间来询问你获取最新的信息）

app.get('/clock',function(req,res){
    // 如果有新的数据了 在响应给服务器

    // res.end
    // res.send

    // res.write 方法不会结束本次的响应
    setInterval(()=>{
        res.write(`
        <script>
            document.domain = 'localhost'
            parent.document.getElementById('clock').innerHTML = "${new Date().toLocaleString()}"
        </script>
        `)
    },1000)

    // 可以保证实时性，而且不用客户端和服务端频繁发, 缺点单向通信
});


app.listen(3000,function(){
    console.log('server start 3000')
})

