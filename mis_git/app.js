var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var config = require('./config');
var db = require('./model/db');
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
var MySQLStore = require('express-mysql-session');
var sessionStore = new MySQLStore({}, db);
//STORING SESSION IN DATABASE ***************************************
 
app.use(cookieParser());
app.use(session({
    secret: "MIS INVOICE",
    name: "MIS INVOICE",
    proxy: true,
    resave: true,
    saveUninitialized: true,
    rolling :true,
    cookie:{maxAge:(2*60*1000)},
    store: sessionStore
}));
/***************ENDED HERE SESSION */
var flash = require('express-flash');
app.use(flash());
/********Middleware for Form Validation ***********/
var Auth = require('./middleware/auth');
app.use('/', Auth.isLoggedIn);
app.get('/',function(req, res, next){
    res.redirect('/delivery');
});
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
    next();
});
/************SETTING PARAMETERS TO USE ON VIEW ENDS HERE **********/


/*************ROTUNG PART GOES HERE */

var priceMasterRouter = require('./router/priceRouter');
app.use('/price', priceMasterRouter);
var invoiceRouter = require('./router/invoiceRouter');
app.use('/invoice', invoiceRouter);

var deliveryRouter = require('./router/deliveryRouter');
app.use('/delivery', deliveryRouter);

var deliveryChangeApprovalRouter = require('./router/deliveryChangeApprovalRouter');
app.use('/change_approval', deliveryChangeApprovalRouter);

var reportRouter = require('./router/reportRouter');
app.use('/report', reportRouter);

var userRouter = require('./router/userRouter');
app.use('/user', userRouter);

var accessRouter = require('./router/accessRouter');
app.use('/access', accessRouter);

var activityReportRouter = require('./router/activityReportRouter');
app.use('/activity_log', activityReportRouter);


/*******ROUTING ENDS HERE */


/************Error HANDLER */
app.use(function (err, req, res, next) {
    // logic
    console.log(err);
    next(err);
})
/************Error HANDLER ENDES HERE*/


var server = http.createServer(app).listen('7070');
console.log('Server is serted and listening on 7070');

