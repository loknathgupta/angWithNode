const express = require('express');
const db = require('./model/db');
const app = new express();
const bodyParser = require('body-parser');
const cors = require('cors');
const userRouter = require('./router/userRouter');


app.set('view engine', 'ejs');
app.use(bodyParser({}));
app.use('/', function(req, res, next){
    console.log('MIDDLEWARE CALLING DONE');    
    next();
});

app.use('/user',cors(), userRouter);

app.get('/', function(req, res, next){
    console.log('APP GET CALLED');  
    next();
});

app.use(function(err, req, res, next){
    console.log('DEFAULT CALLED'+err);
    res.end();
});

app.listen('4343', ()=>{
    console.log('server is listening on 4343');
});