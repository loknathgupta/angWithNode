const express = require('express');
const User = require('../model/userModel');

var router = express.Router();

router.get('/', function(req, res, next){    
    User.getUsers({}, function(err, heroData){
        res.json(heroData);
        // res.render('user/list',{
        //     users : heroData 
        // });        
    });
});

router.post('/add', function(req, res, next){
    delete req.body.save;
    User.saveUser(req.body, function(err, saveStatus){
        console.log(this.sql);
        if(err){
            console.log(err.message);
        }else{
            res.json(req.body);
            //console.log(saveStatus);
            //res.redirect('/user');
        }
    });
});

router.post('/update', function(req, res, next){
    User.updateUser(req.body, function(err, updateStatus){
        if(err){
            console.log(err.message);
        }else{
            res.json(updateStatus);
        }
    });
});

router.get('/delete/:id', function(req, res, next){
    let userId = req.params.id;
    User.deleteUser(userId, function(err, deleteStatus){
        if(err){
            console.log(err.message);
        }else{
            res.json(deleteStatus);
        }
    });
});


module.exports = router;