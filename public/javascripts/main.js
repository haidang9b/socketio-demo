let socket;
let usersOnline = []
let username;
let statusChat = 'global'
let formChat = document.getElementById('formChat')
let txtInput = document.getElementById('txtInput')
let idCurrent = ''
window.onload = () => {
    socket = io();
    
    socket.on('connect', handleNewUserConnectToServer)

    // send danh sách user cho người mới
    socket.on('listUsers', handleListUsers)

    // send user mới cho những người cũ
    socket.on('newUser', handleNewUser)

    // xóa user đã thoát trong danh sách
    socket.on('userLeave', handleUserLeave)

    socket.on('server-send-message-to-client-global', handleNewMessageFromServer)
    // nhận username từ server
    socket.on('server-send-username', handleReceiverUsername)

    //nhận room hiện tại vừa tham gia or vừa tạo
    socket.on('server-send-current-room-name', handleReceiverCurrentRoomName)

    // nhan tin nhan vao room chat
    socket.on('server-send-message-to-client-room', handleReceiverMessageRoom)

    socket.on('server-send-message-private-by-id', handleReceiverMessagePrivate)
    //Nhận room từ server
    socket.on('server-send-room', handleReceiverRooms)
    function handleListUsers (users) { 
        console.log("CLient đã nhận được danh sách")
        users.forEach(element => {
            console.log(element);
            if(element.id !== socket.id){
                usersOnline.push(element)
                renderUserOnline(element)
            }
        });
    }

    function handleNewUser(user){
        // console.log("CLient đã nhận được thông tin người mới từ server")
        // console.log(user)
        usersOnline.push(user)

    }

    function handleUserLeave(id){
        usersOnline = usersOnline.filter(element => element.id !== id)
        console.log(`user ${id} đã thoát, ngoài bạn ra chỉ còn lại ${usersOnline.length} trong phòng`);
        removeUserLeft(id)
    }

    function handleNewUserConnectToServer(){
        username = sessionStorage.getItem('username')
        if(username){
            console.log("tên của bạn là "+username);
        }
        while(!username){
            username = prompt('Vui lòng nhập tên của bạn')
        }
        document.getElementById('thisUsername').innerHTML = `Xin chào <strong>${username} </strong>`
        sessionStorage.setItem('username', username)
        socket.emit('client-send-username',username)
        
    }

    function handleReceiverUsername(data){
        var {id, username} = data
        var user = usersOnline.find(element => element.id === id)
        if(!user){
            return console.log('Không có user này')
        }
        user.username = username
        console.log(`client ${id} có tên là ${username} vừa tham gia nef`)
        renderUserOnline(user)
    }

    function renderUserOnline(user){
        var rowUser = $(`
            <li class='item-user-online' id='${user.id}'><button data-id='${user.id}' data-name='${user.username}' onclick=btnChatWithUser(this)> Chat </button>${user.username}</li>
        `)
        $('#listUsersOnline').append(rowUser)
    }

    function removeUserLeft(id){
        $(`#${id}`).remove()
    }

    function handleReceiverRooms(data){
        $('#listRoom').html('')
        data.map((element) => {
            if(element !=="Kênh thế giới"){
                var rowRoom = $(`
                <li class="item-room"><button data-room="${element}" onclick=ClickJoinPhong(this)> Chat </button> ${element} </li>
                `)
                $('#listRoom').append(rowRoom)
            }
        })
    }
    function handleReceiverCurrentRoomName (data) { 
        $('#labelCurrentRoomName').html(data)
    }

    function handleReceiverMessagePrivate(data){
        // var {id,name,message} = data
        console.log(data)
        var rowMessage = $(`<li class="list-group-item"><strong>${data.name}:</strong> ${data.message}</li>`)
        $('#messages').append(rowMessage)
    }
    function handleNewMessageFromServer(data) {
        console.log(data.username + " Đã gửi : "+ data.message);
        var rowMessage = $(`<li class="list-group-item"><strong>${data.username}:</strong> ${data.message}</li>`)
        $('#messages').append(rowMessage)
    }


    //xu ly tin nhan toi nguoi dung
    $('#formChat').submit((event) => {
        event.preventDefault();
        if(statusChat ==='global'){
            if($('#txtInput').val()){
                console.log("đã submit với data là " + $('#txtInput').val());
                // send tin nhắn
                socket.emit('client-send-message-to-server-global',$('#txtInput').val())
                $('#txtInput').val('')
            }
        }
        if(statusChat === 'room'){
            if($('#txtInput').val()){
                console.log("đã submit với data là " + $('#txtInput').val());
                // send tin nhắn
                socket.emit('client-send-message-to-server-room',$('#txtInput').val())
                $('#txtInput').val('')
            }
        }
        if(statusChat === 'private'){
            if($('#txtInput').val()){
                console.log(socket.id+" đã submit toi" + idCurrent+ " là " + $('#txtInput').val());
                socket.emit('client-send-message-to-user-by-id',{
                    idSend: socket.id,
                    idReceiver: idCurrent,
                    message: $('#txtInput').val()
                })
                $('#txtInput').val('')
            }
        }
    })

    

    function handleReceiverMessageRoom (data){
        // console.log(data.username + " Đã gửi : "+ data.message);
        var nameRoomCurrent = $('#labelCurrentRoomName').html()
        console.log(nameRoomCurrent);
        if(nameRoomCurrent===data.room){
            var rowMessage = $(`<li class="list-group-item"><strong>${data.username}:</strong> ${data.message}</li>`)
        }
        $('#messages').append(rowMessage)
    }
    
    $('#btnCreateRoom').click(() => {
        
        var nameRoom = $('#txtRoom').val()
        if(!nameRoom || nameRoom.length<1){
            $('#msgNotifyCreateRoom').show()
            $('#msgNotifyCreateRoom').html('Vui lòng nhập tên Room')
        }
        else{
            statusChat = 'room'
            socket.emit('client-create-room',nameRoom)
            $('#msgNotifyCreateRoom').hide()
            $('#txtRoom').val('')
            $('#messages').val('')
        }
    })
    


}