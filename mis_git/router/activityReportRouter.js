var express = require('express');
var ActivityLog = require('../model/activityLogModel');
var router = express.Router();
var moment = require('moment');


/* added by sumana 
   monthly revenue report */
router.all('/', function (req, res, next) {
    let activityData = {
        page_url : req.originalUrl,
        action : 'View',
        message : 'Viewing activity logs.',
        created : new Date(),
        created_by : req.session.userData.id,
        requestData : req.body,
        modelUsed : 'ActivityLog'
    }
    ActivityLog.logActivity(activityData, function(err, status){
        if(err){
            console.log('Error in logging activity');
            console.log(err);
        }else{
            var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format( 'MM-YYYY');
            res.render('logs/index', {fromDateInitial:fromDateInitial,  moment: moment });
        }
    });

});

/*for monthly projected dv actual volume */
router.all('/get_activity_log', function (req, res, next) {   
    let condition = {};    
    ActivityLog.getLogs(condition,function (err, logs) {
        if (err) {
            throw err;
        } else {
           console.log(this.sql);
           var data = '{"data":' + JSON.stringify(logs) + "}";
            res.send(data);

        }
    });
});





module.exports = router;