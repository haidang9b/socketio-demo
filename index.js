const express = require('express')
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http);
var path = require('path');
app.set('view engine','ejs')
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req,res) => {
    return res.render("index")
})


// .on la nhận, .emit là send đi
// io.sockets.emit là 1 ng gửi, xong người đó và mọi người đều nhận
// socket.emit a -> server, server -> a
// socket.broadcast.emit là 1 ng gửi,  mọi người đều nhận trừ người gửi
// io.to("socket.id").emit() là send tới 1 người


io.on("connection", socket =>{
    // console.log(`Client ${socket.id} đã kết nối`)
    socket.join("Kênh thế giới")

    let users = Array.from(io.sockets.sockets.values()).map(socket=>({id:socket.id, name: socket.username}))
    // console.log(users)
    // danh sách rooms đang hiện có
    // console.log(users)
    socket.broadcast.emit('newUser', {id: socket.id, name:socket.name})
    // gửi danh sách cho người mới 
    socket.emit('listUsers',Array.from(io.sockets.sockets.values()).map(socket=>({id:socket.id, username: socket.username})))

    socket.on('client-send-username', username => {
        socket.username = username
        socket.broadcast.emit('server-send-username',{id: socket.id,username: username})
    })
    
    //nhận tên room tạo từ client.
    socket.on('client-create-room', data => {
        //join nó vào 1 phòng
        socket.leave("Kênh thế giới")
        socket.join(data);
        //set name phòng 
        var listRooms = []
        socket.nameRoom = data
        console.log(socket.adapter.rooms)
        var tmp = Array.from(io.sockets.sockets.values()).map(socket=>(socket.id))
        // console.log("List user ",tmp)
        console.log(tmp)
        for(var [key, value] of socket.adapter.rooms.entries()){
            // console.log(key + ' = '+ value );
            if(!tmp.includes(key)){
                listRooms.push(key)
            }
        }
        // console.log(listRooms)
        io.sockets.emit('server-send-room',listRooms)
        socket.emit('server-send-current-room-name',data)
    })

    

    // nhận tin nhắn từ server
    socket.on('client-send-message-to-server-global', data => {
        // console.log(`${socket.username} : `+ data)

        io.sockets.in("Kênh thế giới").emit('server-send-message-to-client-global', {message: data, username: socket.username})
    })

    socket.on('client-send-message-to-server-room', data => {
        io.sockets.in(socket.nameRoom).emit('server-send-message-to-client-room',{room:socket.nameRoom,message: data, username: socket.username})
    })

    socket.on('client-in-global-room', () => {
        for(var [key, value] of socket.adapter.rooms.entries()){
            if(key!==socket.id){
                socket.leave(key)
            }
        }
        socket.join("Kênh thế giới")
        console.log(socket.adapter.rooms);
    })

    socket.on('client-send-message-to-user-by-id', ({idSend, idReceiver, message}) => {
        var tmp = Array.from(io.sockets.sockets.values()).map(socket=>({id:socket.id, name: socket.username}))
        var usernameSendMessage = ''
        tmp.forEach(element => {
            if(element.id === idSend){
                console.log(element)
                usernameSendMessage = element.name
            }
        })
        var dataForReceiver = {
            id: idSend,
            name: usernameSendMessage,
            message: message
        }
        var dataForSender = {
            id: idSend,
            name: "(yourself)",
            message: message
        }
        io.to(idReceiver).emit('server-send-message-private-by-id',dataForReceiver)
        io.to(idSend).emit('server-send-message-private-by-id',dataForSender)
        console.log(usernameSendMessage," send message: ",message)
    })
    socket.on('disconnect', () => {
        console.log(`${socket.id} đã thoát`);
        socket.broadcast.emit('userLeave',socket.id)
    })
})


http.listen(3000, ()=>{
    console.log('http://localhost:3000');
})