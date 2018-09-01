var express = require('express');
var UseAccess = require('../model/userAccessModel');
var ActivityLog = require('../model/activityLogModel');
var router = express.Router();
var moment = require('moment');


/* added by sumana 
   monthly revenue report */
router.all('/', function (req, res, next) {

    if (req.session.userData.v_usertype.indexOf("SA") < 0) {
        res.redirect('http://mis.di.com/welcome.php');
    }
    UseAccess.getMenu(0, function (err, mainMenu) {
        if (err) {
            throw err; 
        } else {

            UseAccess.getAllChild(function (err, childMenu) {
                if (err) {
                    throw err;
                } else {
                   // console.log(childMenu)
                    UseAccess.getUserRole(function (err, userRole) {
                        if (err) {
                            throw err;
                        } else {
                            UseAccess.getAllModuleAccess(function (err, userModuleAccess) {
                                if (err) {
                                    throw err;
                                } else {
                                    
                                    res.render('access/index', { mainMenu: mainMenu, childMenu: childMenu, userRole: userRole,userModuleAccess:userModuleAccess, moment: moment });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.all('/saveAccess', function (req, res, next) {

    if (req.session.userData.v_usertype.indexOf("SA") < 0) {
        res.redirect('http://mis.di.com/welcome.php');
    }
    UseAccess.getUserRole(function (err, userRole) {
        if (err) {
            throw err;
        } else {
            UseAccess.saveModuleAccess(userRole,req.body, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    let activityData = {
                        page_url : req.originalUrl,
                        action : 'Update',
                        message : 'Update in access control for all Roles.',
                        created : new Date(),
                        created_by : req.session.userData.id,
                        requestData : req.body,
                        modelUsed : 'UseAccess'
                    }
                    ActivityLog.logActivity(activityData, function(err, status){
                        if(err){
                            console.log('Error in logging activity');
                            console.log(err);
                            next(err);
                        }else{
                            req.flash('info', 'Access control Data saved successfully.');                   
                            res.redirect('/access/');
                        }
                    });

                }
            });
        }
    });
    console.log(req.body);
});



module.exports = router;