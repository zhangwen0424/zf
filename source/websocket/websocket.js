// import express from 'express';

// import http from 'http'; 

// import {WebSocketServer} from 'ws'

// const app = express()
// const server = http.createServer(app); // http服务

// const wss = new WebSocketServer({server})

// wss.on('connection',(ws)=>{
//     console.log('Connection opend')

//     // 给客户端发送消息
//     ws.send('hello client')

//     ws.on('message',function(message){
//         console.log('客户端发送的数据:' + message)
//     });
// })

// server.listen(3000)


// import crypto from 'crypto'

const number = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // 固定
// const websocketKey = 'P2P2F9kEf/wg18RkzXM8eA=='
// const websocketAccept = crypto.createHash('sha1').update(websocketKey + number).digest('base64')

// console.log(websocketAccept)
// key-> P2P2F9kEf/wg18RkzXM8eA==  握手的时候创建一个随机的key
// accept-> adAEOXRx506qcgqahbjvIHPI1Sk=  服务端要响应一个值


import net from 'net'; // 可以接受原始的tcp消息
import crypto from 'crypto'

const server = net.createServer(function(socket){ // 每个人连接都会产生一个socket
    socket.once('data',function(data){
        data = data.toString();
        if(data.match(/Upgrade: websocket/)){ // 说明要升级成websocket协议
            let rows = data.split('\r\n');
            const headers =  rows.slice(1,-2).reduce((memo,row)=>{
                let [key,value] = row.split(': ') 
                memo[key.toLowerCase()] = value;
                return memo
            },{});
            let websocketKey = headers['sec-websocket-key']
             const websocketAccept = crypto.createHash('sha1').update(websocketKey + number).digest('base64')
            let response = [
                'HTTP/1.1 101 Switching Protocols',
                'Upgrade: websocket',
                `Sec-Websocket-Accept: ${websocketAccept}`,
                'Connection: Upgrade',
                '\r\n'
            ].join('\r\n'); // 响应报文
            socket.write(response); // 表示webscoekt建立连接成功


            // 继续解析 后续发来的websocket数据

            socket.on('data',function(buffers){
                /// 解析websocket的格式
                
                // 我门客户端发过来消息了，我想知道这个消息是否结束了 
                // 第一个字节 （1个字节是8个位 ，如何获取第一位是不是1）
                // 或
                // 00001111
                // 11110000
                // 11111111
                // 与
                // 00001111
                // 11111111
                // 00001111
                // 异或
                // 00000111
                // 11110000
                // 11110111

                const FIN = ((buffers[0] & 0b10000000) === 0b10000000); // 表示完成了

                console.log(FIN); // 客户端一次性就将数据全部发送给我了

                const OPCOED = ((buffers[0] & 0b00001111)); // 1表示的是文本,客户端发送的数据就是文本格式
                console.log(OPCOED)

                // 客户端给服务端发送消息 是需要掩码的 所以值肯定是1
                const MASKED = ((buffers[1] & 0b10000000) === 0b10000000); // 需要掩码
                console.log(MASKED)

               
                const PAYLOAD_LEN = ((buffers[1] & 0b01111111)); // 需要掩码
                console.log(PAYLOAD_LEN); // 数据的长度


                const MASK_KEY = buffers.slice(2,6); // 掩码长度是4个字节

                const PAYLOAD = buffers.slice(6); // 真正的数据内容了,这个内容是被掩码过的，需要用掩码做异或操作（相同为0 不同为1）^


                for(let i = 0 ; i < PAYLOAD.length;i++){ // 数据12个字节，掩码是4个字节
                    PAYLOAD[i] = PAYLOAD[i] ^ MASK_KEY[i%4]
                }
                console.log(PAYLOAD.toString()); // 客户端给服务端发送消息 

                // 服务端如果想给客户端发送消息，按照一样的格式发送即可 （服务端给客户端发送消息 是不用+掩码的）

            })




        }
    })
})

server.listen(3000,function(){
    console.log('server start 3000')
})
