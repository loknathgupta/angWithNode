var socket;
var selfUserId, userSelfName, toUserId, toUserEmail, toUserName;
$(function(){    
    socket = io();
    userSelfId = $('#userSelf').attr('data-id');
    userSelfName = $('#userSelf').attr('data-username');
    //alert(userSelfName);
    //LOAD ONLINE USERS ONCE****************************
    $('#chat-arrow').on('click', function(){
        if($('#chatUsers').hasClass('hide')){
            $('#chatUsers ul').html('');
            $.ajax({
                url : '/chat/online_users',
                type : 'get',
                success : function(data){
                    onlineUserIds = [];
                    for(user of data){
                        userDetails = JSON.parse(user['data']);
                        
                        onlineUser = userDetails.userData;
                        if(onlineUser){
                            userId = onlineUser.id;
                            userEmail = onlineUser.v_email;
                            userName = onlineUser.user_name;
                            //onlineUserIds.push(userId);
                            if(onlineUserIds.indexOf(userId) == -1 && userSelfId != userId){
                                $('#chatUsers ul').append("<li> <a class='start_with' href='#' data-id='"+userId+"' data-email='"+userEmail+"' data-username='"+userName+"' >"+userName+"</a></li>")
                                onlineUserIds.push(userId);
                            }
                        }
                    }
                    $('#chatUsers').removeClass('hide').addClass('show');
                }
            })
        }else{
            $('#chatUsers').removeClass('show').addClass('hide');
        }
    });
    //ENDED LOSDIN USERS********************************
    var activeUserId = 0;
    $(document).on('click', '.start_with', function(){
        toUserId = $(this).attr('data-id');
        toUserEmail = $(this).attr('data-email');
        toUserName = $(this).attr('data-username');
        if(toUserId !=  activeUserId){
            $('.chatboxtitle').html(toUserName);
            $('.chatboxcontent').html('');
            $('.chatboxtextarea').val('');
            activeUserId = toUserId;
        }
        $('.chatbox').removeClass('hide').addClass('show');
    });

    $(document).on('keypress', '.chatboxtextarea', function(e){
        if (e.keyCode == 13) {
            msg = $(this).val();
            socket.emit('send_message', { msg: msg, from_name:userSelfName, from_id:userSelfId, to_name:toUserName,  to_id:toUserId  });
            $(this).val('');
        }
    });

    socket.on('send_message', function (msgObj) {
        console.log(msgObj);

        if(msgObj.from_id == userSelfId || msgObj.to_id == userSelfId){
            if(msgObj.from_id == userSelfId){
                fromName = 'You: ';
            }else{
                fromName = msgObj.from_name+': '
            }
            msgToAdd = fromName+ msgObj.msg;
            $('.chatboxcontent').append($('<p>').text(msgToAdd));
            
            //browserNotify('FROM', message=msgObj.msg, 'user-icon.png');
        }
        if($('.chatbox').hasClass('hide')){
            $('.chatbox').removeClass('hide').addClass('show');
            toUserId = msgObj.from_id
            toUserName = msgObj.from_name
            $('.chatboxtitle').html(toUserName);
        }
            
      });
    
});

function closeChatBox(){
    $('.chatbox').removeClass('show').addClass('hide');
}

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