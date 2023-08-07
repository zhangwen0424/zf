## http vs websocket
- http协议主要关注 客户端->服务器 （获取资源）


特点：无状态协议，每个请求都是独立的， 请求应答模式， 服务度无法主动给客户端推送消息 （单工，半双工，全双工）http受浏览器同源策略的影响


## websocket
双向通信 （全双工协议）  每次不用重新建立链接 可以一直相互通信


## 不用websocket 以前是怎样实现双向通信

Comet, 主要这个技术就是为了实现服务端可以像客户端推送数据， 为了解决实时性比较高的情况

- 1.轮询 
- 2.长轮询
- 3.iframe流
- 4.sse EventSource （html提供的，单向通信，客户端可以监控服务端推送的事件， 只能推送文本类型的 适合小数据）
- 5.websocket




**数据帧格式**

> 单位是比特。比如FIN、RSV1各占据1比特，opcode占据4比特

```
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
```

- FIN：1个比特 如果是1，表示这是消息（message）的最后一个分片（fragment），如果是0，表示不是是消息（message）的最后一个分片（fragment）
- RSV1, RSV2, RSV3：各占1个比特。一般情况下全为0。当客户端、服务端协商采用WebSocket扩展时，这三个标志位可以非0，且值的含义由扩展进行定义。如果出现非零的值，且并没有采用WebSocket扩展，连接出错。
- Opcode: 4个比特。操作代码，Opcode的值决定了应该如何解析后续的数据载荷（data payload）。如果操作代码是不认识的，那么接收端应该断开连接（fail the connection）
  - %x0：表示一个延续帧。当Opcode为0时，表示本次数据传输采用了数据分片，当前收到的数据帧为其中一个数据分片。
  - %x1：表示这是一个文本帧（frame）
  - %x2：表示这是一个二进制帧（frame）
  - %x3-7：保留的操作代码，用于后续定义的非控制帧。
  - %x8：表示连接断开。
  - %x9：表示这是一个ping操作。
  - %xA：表示这是一个pong操作。
  - %xB-F：保留的操作代码，用于后续定义的控制帧。
- Mask: 1个比特。表示是否要对数据载荷进行掩码操作
  - 从客户端向服务端发送数据时，需要对数据进行掩码操作；从服务端向客户端发送数据时，不需要对数据进行掩码操作,如果服务端接收到的数据没有进行过掩码操作，服务端需要断开连接。
  - 如果Mask是1，那么在Masking-key中会定义一个掩码键（masking key），并用这个掩码键来对数据载荷进行反掩码。所有客户端发送到服务端的数据帧，Mask都是1。
- Payload length：数据载荷的长度，单位是字节。为7位，或7+16位，或7+64位。
  - Payload length=x为0~125：数据的长度为x字节。
  - Payload length=x为126：后续2个字节代表一个16位的无符号整数，该无符号整数的值为数据的长度。
  - Payload length=x为127：后续8个字节代表一个64位的无符号整数（最高位为0），该无符号整数的值为数据的长度。
  - 如果payload length占用了多个字节的话，payload length的二进制表达采用网络序（big endian，重要的位在前)
- Masking-key：0或4字节(32位) 所有从客户端传送到服务端的数据帧，数据载荷都进行了掩码操作，Mask为1，且携带了4字节的Masking-key。如果Mask为0，则没有Masking-key。载荷数据的长度，不包括mask key的长度
- Payload data：(x+y) 字节
  - 载荷数据：包括了扩展数据、应用数据。其中，扩展数据x字节，应用数据y字节。
  - 扩展数据：如果没有协商使用扩展的话，扩展数据数据为0字节。所有的扩展都必须声明扩展数据的长度，或者可以如何计算出扩展数据的长度。此外，扩展如何使用必须在握手阶段就协商好。如果扩展数据存在，那么载荷数据长度必须将扩展数据的长度包含在内。
  - 应用数据：任意的应用数据，在扩展数据之后（如果存在扩展数据），占据了数据帧剩余的位置。载荷数据长度 减去 扩展数据长度，就得到应用数据的长度。