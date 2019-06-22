var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var config = require('./config');
//var db = require('./model/db');
var io = require('socket.io')(http);

app.locals.configuration = config;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'node_modules')));
/************Body Parser */
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
/********************** */

/***************SESSION ************/
var cookieParser = require('cookie-parser');
var session = require('express-session');

//STORING SESSION IN DATABASE ***************************************
// var MySQLStore = require('express-mysql-session');
// var sessionStore = new MySQLStore({}, db);
//STORING SESSION IN DATABASE ***************************************
 
app.use(cookieParser());
app.use(session({
    secret: "MIS INVOICE",
    name: "MIS INVOICE",
    proxy: true,
    resave: true,
    saveUninitialized: true,
    rolling :true,
    cookie:{maxAge:(24*60*1000)},
   // store: sessionStore
}));
/***************ENDED HERE SESSION */
var flash = require('express-flash');
app.use(flash());
/********Middleware for Form Validation ***********/

/********Middleware for Auth Validation ENDS here */

/** Express Validator Middleware for Form Validation */
var expressValidator = require('express-validator')
app.use(expressValidator())

/************Validation ended here *******************/
app.get('/', (req, res, next)=> {
    res.render('user/chat-only');
})
/************SETTING PARAMETERS TO USE ON VIEW*********************/
app.use(function (req, res, next) {     // req.session.userData = {isLoggedIn:true, id:1,  i_empid:1, v_email:'test@gmail.com', v_usertype : 'SA', user_name : 'Admin'},
    app.locals.profilePicLocation = req.protocol + "://" + req.get('host') + '/uploads/';
    app.locals.host = config.host = req.protocol + "://" + req.get('host');
     
    app.locals.assetsLocation = req.protocol + "://" + req.get('host') + '/assets';
    app.locals.sessUserData = req.session.userData;
    app.locals.configuration = config;
    //console.log(req.session.userData);
    next();
});
/************SETTING PARAMETERS TO USE ON VIEW ENDS HERE **********/


/************Error HANDLER */
app.use(function (err, req, res, next) {
    // logic
    console.log(err);
    next(err);
})

/************Error HANDLER ENDES HERE*/
var users = {};
var activeUserDetails ={};
//SOCKET EVENT*************************************
io.on('connection', function(socket){
    //io.sockets.users = [];
    console.log('a user connected');
    //console.log(socket.id);
    socket.on('addMe', function(name, callback){
        socket.nick = name;
        users[name] = socket;
        callback('Added');
        console.log(Object.keys(users));
        io.sockets.emit('addedUsers', Object.keys(users));
        //console.log(msgObj);
        //io.emit('send_message', msgObj)
    });

    socket.on('sendMessage', function(msg, callback){
        
        let ind = msg.indexOf(' ');
        if(ind == -1){
            callback('user not found here');
        }else {
           let user = msg.substring(0,ind);
           let message = msg.substring(ind+1); 
           if(user in users){
                console.log('Valid');
                users[user].emit('newMessage',{msg:message, from:socket.name});
                //io.sockets.emit('newMessage',{msg:msg, from:socket.name});

           } else{
                console.log('invalid user found here');
            callback('invalid user found here'); 
           }
        }

     });    
    
});
//SOCKET EVENT*************************************

http.listen('7170', function(){    
    console.log('Server is serted and listening on 7170');
});

