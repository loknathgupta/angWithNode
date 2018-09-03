var express = require('express');
var router = express.Router();
var User = require('../model/userModel');

router.get('/', function (req, res, next) {
    res.render('chat/index')
});

router.get('/online_users', function (req, res, next) {
    User.getOnlineUsersForChat()
        .then(function (onlineUsers) {
            res.json(onlineUsers);
        })
        .catch(function (err) {
            console.log('Error in retriening online users.');
            res.json([]);
        });

})

module.exports = router;