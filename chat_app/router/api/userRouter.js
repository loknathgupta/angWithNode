 var express = require('express');
 var User = require('../../model/userModel');
 var passwordHash = require('password-hash');
 var fs = require('fs');

 var url = require('url');
 const mongoose = require('mongoose');

/***********MULTIPART/FORM-DATA FILE UPLOAD SETTINGS STARTS*******/
var multer = require('multer');
const UPLOAD_PATH = 'public/uploads';
let imageFilter = function (req, file, callback) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        //return callback(new Error('Only image files are allowed!'));
        file.error = true;
        file.errorMessage = 'Only image files are allowed!';
        callback(null, true);
    }
    callback(null, true);
}
let storage = multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: function (req, file, callback) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        callback(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
})
var upload = multer({
    //dest: `${UPLOAD_PATH}/`, 
    fileFilter: imageFilter,
    storage: storage
}); // multer configuration 
var uploadProfilePicture = upload.single('pofile_pic');
/***********MULTIPART/FORM-DATA FILE UPLOAD SETTINGS ENDS HERE*******/

var router = express.Router();



router.get('/', (req, res, next)=>{
    User.find()
    .then(users=>{
        res.status(200).json(
            users
        )
    })
    .catch(err=>{
        res.status(400).json({
            error:err
        })
    })
});
router.post('/add', (req, res, next)=>{
    console.log(req.body);
    let user = new User(req.body);
    user['_id'] = new mongoose.Types.ObjectId();
    user['password'] = passwordHash.generate(user['password']);
    user.save()
    .then(result=>{
        res.status(200).json(
            user
        )
    })
    .catch(err=>{
        res.status(400).json({
            error:err
        });
    })
});

router.delete('/:userId', (req, res, next)=>{    
    let userId = req.params.userId;
    console.log(userId);
    User.findOneAndRemove({_id:userId})
    .exec()
    .then(result=>{
        res.status(200).json(
            result
        )
    })
    .catch(err=>{
        res.status(400).json({
            error:err
        })
    });    
});

router.post('/login', (req, res, next)=>{    
    let email = req.body.email;
    let password = req.body.password;
    password = passwordHash.generate(password);
    console.log(password);
    User.findOne({email:email})
    .exec()
    .then(result=>{
        res.status(200).json(
            result
        )
    })
    .catch(err=>{
        res.status(400).json({
            error:err
        })
    });    
});





//save user data


/**************LOGIN FUNCTION STARTS HERE ************/
router.all('/login', function (req, res, next) {
    res.locals.referedFrom = req.session.referedFrom;
    res.locals.msg = '';
    if (req.method == 'GET') {
        let UserData = {
            email: '',
            password: '',
            rememberStatus : ''
        };
        if (req.cookies.rememberme !== undefined) {
            UserData.email = req.cookies.rememberme.email;
            UserData.password = req.cookies.rememberme.password;
            UserData.rememberStatus = 'checked'
        }
        res.render('user/login', { data: UserData })
    } else {
        req.assert('email', 'A valid email id is required.').isEmail();
        req.assert('password', 'Passwors is required.').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            errors.forEach(function (error) {
                req.flash(error.param, error.msg)
            });
            res.render('user/login', { data: req.body });
        } else {
            User.getUserForLogin(req.body, function (err, result) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                   // console.log(result);
                    let user_name;
                    if (result.length > 0 && passwordHash.verify(req.body.password, result[0].password) && result[0].status == 'A') {
                        sess = req.session;
                        let userInfo = result[0];
                        user_name = userInfo.first_name + ' ' + userInfo.last_name;
                        
                        user_role_id = userInfo.user_role.split(",");
                        short_name =  userInfo.short_name.split(",");
                        sess.userData = {
                            isLoggedIn: true,
                            id: userInfo.id,
                            i_empid: userInfo.i_empid,
                            v_email: userInfo.email,
                            v_usertype: short_name,
                            user_name: user_name,
                            user_role: user_role_id
                        };
                        //console.log(sess.userData);
                        let hasAccessUpTo = 'All';
                        if(sess.userData.v_usertype.indexOf('PM') != -1){
                            hasAccessUpTo = "PM";
                        }
                        if(sess.userData.v_usertype.indexOf('AM') != -1){
                            hasAccessUpTo = "AM"; 
                        }
                        if(sess.userData.v_usertype.indexOf('GM') != -1){
                            hasAccessUpTo = "GM"; 
                        }
                        if(sess.userData.v_usertype.indexOf('SA') != -1 || sess.userData.v_usertype.indexOf('IM') != -1 || sess.userData.v_usertype.indexOf('AO') != -1 ){
                            hasAccessUpTo = 'All';
                        }
                        sess.userData.hasAccessUpTo = hasAccessUpTo;

                        if (req.body.RememberMe) {
                            let path = req.path;
                            let domain = req.get('host');
                            res.cookie('rememberme', { email: req.body.email, password: req.body.password }, { expires: new Date(Date.now() + 86400 * 1000) });
                        }else{
                            res.cookie('rememberme', {}, { expires: new Date(Date.now() - 86400 * 1000) });
                        }
                        //console.log(userInfo);
                        UserAccess.getPMenuByRole(user_role_id,short_name, function (err, pMenuAll) {

                            if (err) {
                                throw err;
                            } else {
                                 // console.log(this.sql);
                                UserAccess.getCMenuByRole(user_role_id, short_name, function (err, cMenuAll) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        console.log(this.sql);
                                        let activityData = {
                                            page_url: req.originalUrl,
                                            action: 'Login',
                                            message: user_name + ' has logged in.',
                                            created: new Date(),
                                            created_by: req.session.userData.id,
                                            requestData: userInfo,
                                            modelUsed: 'User'
                                        }
                                        ActivityLog.logActivity(activityData, function (err, status) {
                                            if (err) {
                                                console.log('Error in logging activity');
                                                console.log(err);
                                            } else {

                                                //  console.log(this.sql);
                                                sess.userData.parentMenuAll = pMenuAll;
                                                sess.userData.childMenuAll = cMenuAll;
                                                //console.log(req.body.referedFrom);
                                                // if(req.body.referedFrom && req.body.referedFrom != req.protocol + "://" + req.get('host') +'/user/login'){
                                                //     res.redirect(req.body.referedFrom);
                                                // }else{
                                                //     if(userInfo.short_name == 'SA'){
                                                //         res.redirect('/price/');
                                                //     }else {
                                                //         res.redirect('/delivery/');
                                                //     }
                                                // }

                                                if(short_name.indexOf("SA") >= 0){
                                                    res.redirect('/price/');
                                                } else {
                                                    res.redirect('/delivery/');
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    } else {
                        if (result.length > 0 && passwordHash.verify(req.body.password, result[0].password) && result[0].status != 'A') {
                            res.locals.msg = 'Your are not an active user.';
                        } else {
                            res.locals.msg = 'Invalid Email OR Password.';
                        }
                        res.render('user/login', { data: req.body });
                    }
                }
            })
        }
    }
})
/**************LOGIN FUNCTION ENDS HERE ************/


/********************LOGOUT FUNCTION ***************/
router.all('/logout', function (req, res, next) {
    User.getUsers({ id: req.session.userData.id }, function (err, userData) {
        if (err) {
            next(err);
        } else {
            let userDetails = userData[0];
            let userName = userDetails['first_name'] + ' ' + userDetails['last_name'];
            let activityData = {
                page_url: req.originalUrl,
                action: 'Logout',
                message: userName + ' has logged out.',
                created: new Date(),
                created_by: (req.session.userData.id ? req.session.userData.id : 0),
                requestData: req.body,
                modelUsed: 'User'
            }
            ActivityLog.logActivity(activityData, function (err, status) {
                if (err) {
                    console.log('Error in logging activity');
                    console.log(err);
                    next(err);
                } else {
                    if (req.session.userData) {
                        delete req.session.userData;
                        req.session.referedFrom = '';
                    }
                    res.redirect('/user/login');
                }
            });
        }
    })

})
/*******************ENDS HERE LOGOUT****************/


router.all('/change-password', function (req, res, next) {
    var UserId = req.session.userData.id;
    User.getUsers({ id: UserId }, function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            let userData = result[0];
            if (req.method === 'GET') {
                let userRoleId = userData.user_role_id;
                res.render('user/change-password.ejs', { data: userData });
            } else if (req.method == 'POST') {
                req.assert('old_password', 'Old Password is required.').notEmpty();
                req.assert('new_password', 'New Password is required.').notEmpty();
                req.assert('confirm_password', 'Confirm Password is required.').notEmpty();

                let errors = req.validationErrors();
                let errorMessage = '';
                if (errors) {
                    errors.forEach(error => {
                        errorMessage += error.msg + ' ';
                    });
                    req.flash('errorMessage', errorMessage);
                    res.render('user/change-password.ejs', { data: req.body });
                } else {
                    if (req.body.new_password != req.body.confirm_password) {
                        req.flash('errorMessage', 'New Password and Confirm Password are not the same.');
                        return res.render('user/change-password.ejs', { data: req.body });
                    }
                    // console.log(userData.password);
                    if (passwordHash.verify(req.body.old_password, userData.password)) {                        
                        let passwordData = {}
                        if (req.body.new_password) {
                            passwordData.password = passwordHash.generate(req.body.new_password);
                        }
                        // console.log(passwordData);
                        User.updateUser(passwordData, { id: UserId }, function (err, statusData) {
                            if (err) {
                                return next(err);
                            } else {
                                let user_name = userData.first_name+' '+userData.last_name;
                                let activityData = {
                                    page_url: req.originalUrl,
                                    action: 'Password Change',
                                    message: user_name + ' has changed the account password.',
                                    created: new Date(),
                                    created_by: req.session.userData.id,
                                    requestData: userData,
                                    modelUsed: 'User'
                                }
                                ActivityLog.logActivity(activityData, function (err, status) {
                                    if (err) {
                                        console.log('Error in logging activity');
                                        console.log(err);
                                    } else {
                                        req.flash('successMessage', 'Password has been changed.');
                                        res.redirect('/user/profile');
                                    }
                                });
                            }
                        });
                    }else{
                        req.flash('errorMessage', 'Old password is wrong.');
                        res.render('user/change-password.ejs', { data: req.body });
                    }

                }
            }
        }
    });
});
/*export data from mis client table */
router.all('/syncClient', function (req, res, next) {
     
    var q = req.headers.referer.split("/");
    var fromUrl = q[3];
   // console.log(q);
    Client.exportClientFromMis(req, function (err, result) {
       // console.log(q);
        req.flash('info', 'Client data imported from MIS database successfully.');
        if(fromUrl=='user'){
            res.redirect('/user');
        }else{
            res.redirect('/price');
        }
    });
})


module.exports = router;