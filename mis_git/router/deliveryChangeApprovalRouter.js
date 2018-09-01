var express = require('express');
var Price = require('../model/priceModel');
var Delivery = require('../model/deliveryModel');
var DeliveryChangeRequest = require('../model/deliveryChangeRequestModel');
var CustomPrice = require('../model/customPriceModel');
var ActivityLog = require('../model/activityLogModel');
var router = express.Router();
var moment = require('moment');
var API = require('../model/apiModel');

router.all('/', function (req, res, next) {  
    let activityData = {
        page_url : req.originalUrl,
        action : 'View',
        message : 'Viewing changes request/custom price added.',
        created : new Date(),
        created_by : req.session.userData.id,
        requestData : req.body,
        modelUsed : 'CustomPrice'
    }
    ActivityLog.logActivity(activityData, function(err, status){
        if(err){
            console.log('Error in logging activity');
            console.log(err);
            next(err);
        }else{
            res.render('change_approval/index');
        }
    });
});

router.get('/get_requests', function(req, res, next){
    DeliveryChangeRequest.getAllChangeRequest(req.body,  function (err, requests) {
        if (err) {
            console.log("Error in retrieving all requested changes....");
            console.log(err);
            next(err);
        } else {
            var data = '{"data":' + JSON.stringify(requests) + "}";
            res.send(data);
        }
    }); 
});

router.post('/update_status', function(req, res, next){
    console.log(req.body);
    DeliveryChangeRequest.updateChangeRequestStatus(req.body, req.session.userData, function (err, status) {
        if (err) {
            console.log("Error in updating status requested changes....");
            console.log(err);
            next(err);
        } else {
            // console.log(status.affectedRows);
            DeliveryChangeRequest.getChangeRequestDetails(req.body.requestId, function(err, requestData){
                if(err){
                    next(err);
                }else{
                    let changeRequestDetails = requestData[0];
                    let status;
                    if(req.body.updateStatus == 1){
                        status = 'Approving';
                    }else{
                        status = 'Rejecting';
                    }
                    let activityData = {
                        page_url : req.originalUrl,
                        action : 'Update',
                        message : status+' the change request made for client ('+changeRequestDetails.v_company+') for delivery date '+moment(changeRequestDetails.delivery_date).format("DD-MM-YYYY")+'.',
                        created : new Date(),
                        created_by : req.session.userData.id,
                        requestData : req.body,
                        modelUsed : 'DeliveryChangeRequest'
                    }
                    ActivityLog.logActivity(activityData, function(err, status){
                        if(err){
                            console.log('Error in logging activity');
                            console.log(err);
                            next(err);
                        }else{
                            let resposeData;
                            if(status.affectedRows > 0){
                                resposeData = {success:true, message : 'Status of the change request has been updated.'};
                            }else{
                                resposeData = {success:false, message : 'There was something unexpected.'};
                            }
                            res.send(resposeData);
                        }
                    });
                }
            });
            
        }
    }); 
})

router.get('/get_pending_custom_prices', function(req, res, next){
    CustomPrice.getAllPendingCustomPrices(req.body,  function (err, requests) {
        if (err) {
            console.log("Error in retrieving all requested changes....");
            console.log(err);
            next(err);
        } else {
            var data = '{"data":' + JSON.stringify(requests) + "}";
            res.send(data);
        }
    }); 
});

router.get('/get_custom_price/(:id)', (req, res, next) => {
    let customPriceId = req.params.id;
    CustomPrice.getCustomPriceDetails(customPriceId, (err, customPriceData) => {
        if(err){
            next(err);
        }else{
             console.log(customPriceData);
             customPriceData[0].requested = moment(customPriceData[0].requested).format('DD-MM-YYYY');
            res.render('change_approval/custom_price_details', {customPriceData:customPriceData[0]});
        }
    });
})


router.post('/update_custom_price_status', function(req, res, next){
    let requestId = req.body.requestId;
    let updatedStatus = req.body.updateStatus;
    dateArr = req.body.requested.split("-");
    req.body.requested = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];
    CustomPrice.updateCustomPrice(req.body, req.session.userData, function (err, status) {
        // console.log(this.sql);
        if (err) {
            console.log("Error in updating status in custom_price_master....");
            console.log(err);
            next(err);
        } else {
            CustomPrice.getCustomPriceDetails(requestId, function(err, customPriceData){
                if(err){
                    next(err);
                }else{
                    let customPriceDetails = customPriceData[0];
                    let status;
                    if(updatedStatus == 1){
                        status = 'Approving';
                    }else{
                        status = 'Rejecting';
                    }
                    let activityData = {
                        page_url : req.originalUrl,
                        action : 'Update',
                        message : status+' the custom price for client ('+customPriceDetails.v_company+') for delivery date '+moment(customPriceDetails.start_date).format("DD-MM-YYYY") +'.',
                        created : new Date(),
                        created_by : req.session.userData.id,
                        requestData : req.body,
                        modelUsed : 'CustomPrice'
                    }
                    ActivityLog.logActivity(activityData, function(err, status){
                        if(err){
                            console.log('Error in logging activity');
                            console.log(err);
                            next(err);
                        }else{
                            let resposeData;
                            if(status.affectedRows > 0){
                                resposeData = {success:true, message : 'Status of the change request has been updated.'};
                            }else{
                                resposeData = {success:false, message : 'There was something unexpected.'};
                            }
                            res.send(resposeData);
                        }
                    });
                }
            });
            
        }
    }); 
});

router.get('/suspended_price_head', (req, res, next) => {
    Price.getSuspendedPriceHeads(function(err, priceHeads){
        if(err){
            next(err);
        }else{
            // console.log(this.sql);
            res.render('change_approval/suspended_price_heads',{
                suspendedPriceHeads:priceHeads
            });
        }
    });
});

router.post('/activate_suspended_heads', (req, res, next) => {
    let priceHeads = req.body.price_master;
    Price.resumePriceHeads(priceHeads, function(err, priceStatusData){
        
        if(err){
            next(err);
        }else{
            Price.getPriceHeadName(priceHeads, function (err, priceData) {
                if (err) {
                    next(err);
                } else {
                    let priceHeadDetail = priceData[0];
                    let activityData = {
                        page_url: '/price/activate',
                        action: 'Activation',
                        message: 'Price head (' + priceHeadDetail['head_name'] + ') activated again.',
                        created: new Date(),
                        created_by: req.session.userData.id,
                        requestData: req.body,
                        modelUsed: 'PriceMaster'
                    }
                    ActivityLog.logActivity(activityData, function (err, status) {
                        if (err) {
                            next(err);
                        } else {
                            //WMS API WOULD BE CALLED IN THE BACKGRUOND
                            if(Array.isArray(priceHeads)){
                                priceHeads.forEach(function(priceHeadId){                                
                                    API.callWMSPriceHeadAPI(priceHeadId, 'update');
                                });
                            }else{
                                API.callWMSPriceHeadAPI(priceHeads, 'update');
                            }
                            //API CALL ENDED HERE ********************** 
                            if(priceStatusData.affectedRows){
                                res.json({status: 'success', message: 'Selected price heads has been activated.'});
                            }else{
                                res.json({status: 'success', message: 'Selected price heads has no tbeen activated.'})
                            }
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;