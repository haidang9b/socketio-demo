function ClickJoinPhong(target) { 
    // console.log("Vwaf taoj phongf");
    // console.log()
    if(idCurrent !== target.dataset.room){
        statusChat = 'room'
        $('#messages').html('')
        idCurrent = target.dataset.room
        console.log(idCurrent, target.dataset.room)
        $('#labelCurrentRoomName').html(target.dataset.room)
        socket.emit('client-create-room', target.dataset.room)
    }
}

function btnChatWithUser(target){
    // console.log(idCurrent !== target.dataset.id)
    if(idCurrent !== target.dataset.id){
        statusChat = 'private';
        $('#messages').html('')
        idCurrent = target.dataset.id;
        $('#labelCurrentRoomName').html(target.dataset.name)
    }
}

function joinChatKenhTheGioi(){
    if(statusChat === 'global'){
        // statusChat = 'global'
        // $('#messages').html('')
        $('#labelCurrentRoomName').html('Kênh thế giới')
        socket.emit('client-in-global-room',true)
    }
    else{
        statusChat = 'global'
        $('#messages').html('')
        $('#labelCurrentRoomName').html('Kênh thế giới')
        socket.emit('client-in-global-room',true)
    }
    
}