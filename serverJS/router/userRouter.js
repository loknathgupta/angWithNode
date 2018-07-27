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
        if(err){
            console.log(err.message);
        }else{
            res.json(req.body);
            //console.log(saveStatus);
            //res.redirect('/user');
        }
    });
});


module.exports = router;