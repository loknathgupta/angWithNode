var express = require('express');
var app = express();
var http = require('http').Server(app);
var db = require('./model/db');
var io = require('socket.io')(http);
var config ={};
app.locals.configuration = config;

app.set('view engine', 'ejs');
app.use(express.static(__dirname+'public'));

/************Body Parser */
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
/********************** */

/***************SESSION ************/
var cookieParser = require('cookie-parser');
var session = require('express-session');

//STORING SESSION IN DATABASE ***************************************
//var MySQLStore = require('express-mysql-session');
//var sessionStore = new MySQLStore({}, db);
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
    //store: sessionStore
}));
/***************ENDED HERE SESSION */
var flash = require('express-flash');
app.use(flash());
/********Middleware for Form Validation ***********/

/*var Auth = require('./middleware/auth');
app.use('/', Auth.isLoggedIn);
app.get('/',function(req, res, next){
    res.redirect('/delivery');
});*/
/********Middleware for Auth Validation ENDS here */

/** Express Validator Middleware for Form Validation */
var expressValidator = require('express-validator')
app.use(expressValidator())
/************Validation ended here *******************/

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


/*************ROTUNG PART GOES HERE */

//var chatRouter = require('./router/chatRouter');
//app.use('/chat', chatRouter);


/*******ROUTING ENDS HERE */

app.get('/', function(req, res){
    res.render('sample/add');
})

var userRoute = require('./router/userRouter');
app.use('/user', userRoute);


/************Error HANDLER */

app.use(function (err, req, res, next) {
    // logic
    console.log(err);
    next(err);
})
/************Error HANDLER ENDES HERE*/
var mongo = require('mongodb');
var dbUrl = "mongodb://localhost:27017";
var MongoClient = mongo.MongoClient;
var db;
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, client) {
    if (err){ 
        console.log('Error here....')
        next(err);
    }
    else{
        console.log("Database connected...");
        db = client.db('chat_db');
        //console.log(db);
        var server = http.listen('7070', function(err){   
            if(err){
                console.log('Error in listening on 7070');
            } else{
                console.log('Server is started and listening on 7070');
            }
            //console.log(db);
        });
    }
});



var users = [];
var activeUserDetails ={};
//SOCKET EVENT*************************************
//io.listen(server);
io.on('connection', function(socket){
    //io.sockets.users = [];
    console.log('a user connected');
    //console.log(socket.id);
    socket.username = "Anonymous";
    updateOnlineUsers(); 
    
    socket.on('disconnect', function(){
        console.log('a user dis-connected');
        if(activeUserDetails[socket.id]){
            let userIdForSocket = activeUserDetails[socket.id]['userId'];
            users.splice(users.indexOf(userIdForSocket), 1);
        }       
        delete activeUserDetails[socket.id];
        updateOnlineUsers(); 
    });

    socket.on('send_message', function(msgObj){
        //console.log(msgObj);
        io.emit('send_message', msgObj)
    });

    socket.on('makeOnline', function(userObj){    
        if(users.indexOf(userObj.userId) == -1){
            activeUserDetails[socket.id] = userObj;
            users.push(userObj.userId);
            //io.emit('makeOnline', userObj);
        }
        updateOnlineUsers();
    });
    function updateOnlineUsers(){
        //console.log('Online Users Updated...');
        io.sockets.emit('getOnlineUsers', activeUserDetails);
    }
    
});
//SOCKET EVENT*************************************


