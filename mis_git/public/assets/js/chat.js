var socket = io();
var selfUserId, userSelfName, toUserId, toUserEmail, toUserName;
$(function () {
    userSelfId = $('#userSelf').attr('data-id');
    userSelfName = $('#userSelf').attr('data-username');
    //alert(userSelfName);
    
    $('#chat-arrow').on('click', function () {
        $('#chatUsers').slideToggle();
    });
    
    var activeUserId = 0;
    $(document).on('click', '.start_with', function () {
        toUserId = $(this).attr('data-id');
        toUserEmail = $(this).attr('data-email');
        toUserName = $(this).attr('data-username');
        /*if (toUserId != activeUserId) {
            $('.chatboxtitle').html(toUserName);
            $('.chatboxcontent').html('');
            $('.chatboxtextarea').val('');
            activeUserId = toUserId;
        }
        $('.chatbox').removeClass('hide').addClass('show');*/  
        if($('#chat_with_'+toUserId).length < 1){
            newChatBox(toUserId, toUserEmail, toUserName);
            //alert('add');
        }else{
            //alert('show');
            $('#chat_with_'+toUserId).removeClass('hide').addClass('show');
        }

    });

    $(document).on('keypress', '.chatboxtextarea', function (e) {
        if (e.keyCode == 13) {
            var toUserName = $(this).parents('.chatbox').attr('userName');
            var toUserId = $(this).parents('.chatbox').attr('userId');
            msg = $(this).val();
            socket.emit('send_message', { msg: msg, from_name: userSelfName, from_id: userSelfId, to_name: toUserName, to_id: toUserId });
            $(this).val('');
        }
    });

    socket.on('send_message', function (msgObj) {
        //console.log(msgObj);
        var sender = msgObj.from_id;
        var receiver = msgObj.to_id;
        if (msgObj.from_id == userSelfId || msgObj.to_id == userSelfId) {
            if (msgObj.from_id == userSelfId) {
                fromName = 'You: ';
            } else {
                fromName = msgObj.from_name + ': '
            }
            msgToAdd = fromName + msgObj.msg;

            if($('#chat_with_'+sender+', #chat_with_'+receiver).length < 1){
                newChatBox(msgObj.from_id, '', msgObj.from_name);
            }

            
            $('#chat_with_'+sender+', #chat_with_'+receiver).find('.chatboxcontent').append($('<p>').text(msgToAdd));
            if ($('#chat_with_'+sender+', #chat_with_'+receiver).hasClass('hide')) {
                $('#chat_with_'+sender+', #chat_with_'+receiver).removeClass('hide').addClass('show');
                toUserId = msgObj.from_id
                toUserName = msgObj.from_name
                $('#chat_with_'+sender+', #chat_with_'+receiver).find('.chatboxtitle').html(toUserName);
            }

            //browserNotify('FROM', message=msgObj.msg, 'user-icon.png');
        }

    });


    socket.on('getOnlineUsers', function (onlineUserSockets) {
        $('#chatUsers ul').html('');
        //console.log(userSelfId);
        for (userSocket in onlineUserSockets) {
            console.log(onlineUserSockets[userSocket]);
            userId = onlineUserSockets[userSocket]['userId'];
            userEmail = onlineUserSockets[userSocket]['userEmail'];
            userName = onlineUserSockets[userSocket]['userName'];
            if(userSelfId != userId)
            $('#chatUsers ul').append("<li> <a class='start_with' href='#' data-id='" + userId + "' data-email='" + userEmail + "' data-username='" + userName + "' >" + userName + "</a></li>")
        }
    });

    $

    $(document).on('click', '.close-chatbox', function(){
        $(this).parents('.chatbox').removeClass('show').addClass('hide');
    });

    
function newChatBox(userId, userEmail, userName){
    var chatWindow = $('#chatboxTemplate').clone();
    chatWindow.removeClass('hide').addClass('show');
    chatWindow.attr('id', 'chat_with_'+userId);
    chatWindow.attr('userId', userId);
    chatWindow.attr('userName', userName);
    chatWindow.attr('userEmail', userEmail);
    chatWindow.find('.chatboxtitle').html(userName);
    chatWindow.find('.chatboxcontent').html('');
    chatWindow.find('.chatboxtextarea').val('');
    $('.chatbox-container').append(chatWindow);
}

});


//CHATING FUNCTIONALITY STARTS ***********************************
function browserNotify(theTitle, theBody, theIcon) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support system notifications");
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        // var notification = new Notification("Hi there!");
        var options = {
            body: theBody,
            icon: theIcon
        }
        var n = new Notification(theTitle, options);
        //setTimeout(n.close.bind(n), 500000);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });
    }

    // Finally, if the user has denied notifications and you 
    // want to be respectful there is no need to bother them any more.
}
  //CHATING FUNCTIONALITY ENDS ***********************************
