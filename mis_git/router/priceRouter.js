var express = require('express');
var Price = require('../model/priceModel');
var Client = require('../model/clientModel');
var Employee = require('../model/employeeModel');
var BillingCycle = require('../model/billingCycleModel');
var CreditPeriod = require('../model/creditPeriodModel');
var Currency = require('../model/currencyModel');
var PriceSlab = require('../model/priceSlabModel');
var ActivityLog = require('../model/activityLogModel');
var Delivery = require('../model/deliveryModel');
var API = require('../model/apiModel');
var router = express.Router();
var moment = require('moment');
var mail = require('../email');
//var config = require('../config');



/* added by sumana 
   listing for price */
router.all('/', function (req, res, next) {

    /*if (req.session.userData.v_usertype != 'SA') {
        res.redirect('http://mis.di.com/welcome.php');
    }*/

    Client.getClientAll(function (err, clientList) {
        if (err) {
            console.log("error occured to fetch client");
        } else {
            Employee.getPMAll(function (err, employeeList) {
                if (err) {
                    throw (err);
                    console.log("error occured to fetch pm");
                } else {
                    BillingCycle.getBillingCycleAll(function (err, billingCycleList) {
                        if (err) {
                            console.log("error occured to fetch billing cycle");
                        } else {
                            CreditPeriod.getCreditPeriodAll(function (err, cPeriodList) {
                                if (err) {
                                    console.log("error occured to fetch credit period");
                                } else {
                                    Currency.getAllCurrency(function (err, currencyList) {
                                        if (err) {
                                            console.log("error occured to fetch currency list.");
                                        } else {
                                            Employee.getAMAll(function (err, amList) {
                                                if (err) {
                                                    console.log("error occured to fetch AM LIst");
                                                } else {

                                                    Employee.getAOAll(function (err, aoList) {
                                                        if (err) {
                                                            throw err;
                                                        } else {
                                                           // console.log(req);
                                                            if (req.query.id) {
                                                                Price.getPriceDetail(req.query.id, function (err, priceDetail) {
                                                                    if (err) {
                                                                        console.log("error occured to fetch price details LIst");
                                                                    } else {

                                                                        //console.log(priceDetail);
                                                                        var resprice = [];
                                                                        Price.getPriceLog(req.query.id, priceDetail[0].parent_id, resprice, function (err, priceLog) {
                                                                            if (err) {
                                                                                throw (err);
                                                                                console.log("error occured to fetch price log LIst");
                                                                            } else {
                                                                                PriceSlab.getPricingSlabs(req.query.id, function(err, PricingSlabData){
                                                                                    if(err){
                                                                                        next(err);
                                                                                    }else{
                                                                                        //************************************************ */
                                                                                        let activityData = {
                                                                                            page_url : req.originalUrl,
                                                                                            action : 'View',
                                                                                            message : 'Viewing price master.',
                                                                                            created : new Date(),
                                                                                            created_by : req.session.userData.id,
                                                                                            requestData : req.body,
                                                                                            modelUsed : 'Price'
                                                                                        }
                                                                                        ActivityLog.logActivity(activityData, function(err, status){
                                                                                            if(err){
                                                                                                console.log('Error in logging activity');
                                                                                                console.log(err);
                                                                                            }else{
                                                                                                resprice.push(priceLog)
                                                                                                // console.log(PricingSlabData[0]['vprice']);
                                                                                                let PricingSlabs = {vprice:[], vfrom:[], vto:[]};
                                                                                                if(PricingSlabData[0]['vprice']){
                                                                                                    PricingSlabs.vprice = PricingSlabData[0]['vprice'].split(',');
                                                                                                    PricingSlabs.vfrom = PricingSlabData[0]['vfrom'].split(',');
                                                                                                    if(PricingSlabData[0]['vto']){
                                                                                                        PricingSlabs.vto = PricingSlabData[0]['vto'].split(',');
                                                                                                    }
                                                                                                }
                                                                                                // console.log(priceDetail);
                                                                                                res.render('price/edit_price', { 
                                                                                                    clientList: clientList, 
                                                                                                    employeeList: employeeList, 
                                                                                                    billingCycleList: billingCycleList, 
                                                                                                    cPeriodList: cPeriodList, 
                                                                                                    currencyList: currencyList, 
                                                                                                    amList: amList, 
                                                                                                    priceDetail: priceDetail, 
                                                                                                    id: req.query.id, 
                                                                                                    priceLog: resprice,
                                                                                                    aoList:aoList, 
                                                                                                    moment: moment,
                                                                                                    PricingSlabs : PricingSlabs
                                                                                                 });
                                                                                            }
                                                                                        });
                                                                                        //*********************************************** */

                                                                                    }
                                                                                })
                                                                                
                                                                            }


                                                                        });

                                                                    }
                                                                });
                                                            } else {
                                                                if (req.query.add) {
                                                                    res.render('price/edit_price', { clientList: clientList, employeeList: employeeList, billingCycleList: billingCycleList, cPeriodList: cPeriodList, currencyList: currencyList, amList: amList,aoList:aoList, moment: moment });
                                                                } else {
                                                                    res.render('price/index', { clientList: clientList, employeeList: employeeList, billingCycleList: billingCycleList, cPeriodList: cPeriodList, currencyList: currencyList, amList: amList,aoList:aoList, moment: moment });
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });


});

/*for datatable */
router.all('/getData', function (req, res, next) {
   /* if (req.session.userData.v_usertype != 'SA') {
        res.redirect('http://mis.di.com/welcome.php');
    }*/
    Price.getPriceAll(function (err, priceList) {
        if (err) {
            throw err;
        } else {
           // console.log(priceList);
            var data = '{"data":' + JSON.stringify(priceList) + "}";
            // res.json(priceList);
            res.send(data);

        }
    });
});

/*add price by sumana */
router.all('/add', function (req, res, next) {
   /* if (req.session.userData.v_usertype != 'SA') {
        res.redirect('http://mis.di.com/welcome.php');
    }*/
    var postData = req.body;
    var volumeData = {};
  
    if (postData.start_date) {
        let newDate = postData.start_date.split("-");

        postData.start_date = newDate[2] + '-' + newDate[1] + '-' + newDate[0];;

    }
    // console.log(postData);
    // else if (postData.account_manager_id == '') {
    //     errMsg += "Please select AM";
    // }

    var errMsg = '';
    if (postData.i_clientid == '') {
        errMsg = "Please select client";
    } else if (postData.i_empid == '') {
        errMsg += "Please select PM";
    } else if (postData.invoice_item == '') {
        errMsg += "Please enter invoice item.";
    } else {
        errMsg = '';
    }
    if (errMsg != '') {
        res.send({ success: false, msg: errMsg });
    }
    if(postData.account_manager_id == '' || !postData.account_manager_id){
        postData.account_manager_id = null;
    }
    postData.invoice_item = postData.invoice_item.trim();
    postData.price_unit = postData.price_unit.trim();
    postData.price_per_unit = postData.price_per_unit.trim();
    var conditions = { invoice_item: postData.invoice_item, i_clientid: postData.i_clientid, start_date: postData.start_date };
    Price.getUniqPrice(conditions, function (err, uniqPrice) {
        if (err) {
            throw err;
        } else {
            console.log(uniqPrice);
            if (uniqPrice.length > 0) {

                res.send({ success: false, msg: "Same price item already exists." });
            } else {
                postData.created = new Date();
                postData.modified = new Date();
                if (req.session.userData.isLoggedIn) {
                    postData.created_by = req.session.userData.id;
                    postData.modified_by = req.session.userData.id;
                }

                if (postData.end_date) {
                    let newDate = postData.end_date.split("-");
                    postData.end_date = newDate[2] + '-' + newDate[1] + '-' + newDate[0];
                }
                volumeData.volume = req.body.monthly_volume;
                delete postData.monthly_volume;
                if(postData.billing_day == ''){
                    postData.billing_day = 0;
                }
                let addedPriceId;
                Price.savePrice(postData, function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        // console.log(result);
                        addedPriceId = result.insertId;
                        if(postData.client_status ==2){
                            Price.updateMulTiplePrice({"client_status":postData.client_status},postData.i_clientid, function(err,result){

                            
                        Price.getPriceDetail(addedPriceId, function(err, priceData){
                            if(err){
                                next(err);
                            }else{
                                let priceHeadDetail = priceData[0];
                                let activityData = {
                                    page_url : req.originalUrl,
                                    action : 'Add',
                                    message : 'Adding a pricing head "'+ priceHeadDetail.invoice_item +'" for client ('+priceHeadDetail.client_name+').',
                                    created : new Date(),
                                    created_by : req.session.userData.id,
                                    requestData : req.body,
                                    modelUsed : 'Price'
                                }
                                ActivityLog.logActivity(activityData, function(err, status){
                                    if(err){
                                        console.log('Error in logging activity');
                                        console.log(err);
                                    }else{
                                        Price.getMailRecipients(addedPriceId, postData, function(err, recipients){
                                            if(err){
                                                next(err);
                                            }else{
                                                res.send({ success: true, msg: "1 price row has been added." });
                                                // MAIL WILL BE SEND IN THE BACKGOUND
                                                let mailRecipients = recipients[0]['mail_recipients'];
                                                let allMailRecipients = mailRecipients.split(',');
                                                //console.log(allMailRecipients);
                                                // allMailRecipients.push('loknath.g@dimensionindia.com');
                                                let message = `Dear Portal User, <br><br>
                                                    Please note a new pricing head "${priceHeadDetail.invoice_item}" has been added for client "${priceHeadDetail.client_name}" with "${priceHeadDetail.price_unit}" as "Unit of Measurement", "${priceHeadDetail.effort_per_unit}" as "Effort Per Unit".
                                                    <br><br>
                                                    Regards<br><br>
                                                    IT Support`;
                                                    //console.log(message);
                                                    let mailOptions = {
                                                        from: ' "DIN MIS" <noreply@dimensionindia.com>', // sender address
                                                        replyTo: ' "Suport" <suport@dimensionindia.com>', // reply to address
                                                        to: allMailRecipients, // list of receivers
                                                        subject: 'DIN MIS – New Pricing Head Added', // Subject line
                                                        //  text: message, // plain text body
                                                        html: message // html body
                                                    };
                                                    mail.sendMail(mailOptions, function(err, info){
                                                        if (err) {
                                                            return next(error);
                                                        }else{
                                                            return true;
                                                            //res.send({ success: true, msg: "1 price row has been added." });
                                                        }
                                                    }); 
                                                    // MAIL WILL BE SEND IN THE BACKGOUND 
                                                    //WMS API WOULD BE CALLED IN THE BACKGRUOND
                                                    API.callWMSPriceHeadAPI(addedPriceId, 'add');
                                                    //API CAL ENDED HERE ********************** 
                                            }
                                        });
                                        
                                    }
                                });
                            }
                        })
                    })
                }else{
                    Price.getPriceDetail(addedPriceId, function(err, priceData){
                        if(err){
                            next(err);
                        }else{
                            let priceHeadDetail = priceData[0];
                            let activityData = {
                                page_url : req.originalUrl,
                                action : 'Add',
                                message : 'Adding a pricing head "'+ priceHeadDetail.invoice_item +'" for client ('+priceHeadDetail.client_name+').',
                                created : new Date(),
                                created_by : req.session.userData.id,
                                requestData : req.body,
                                modelUsed : 'Price'
                            }
                            ActivityLog.logActivity(activityData, function(err, status){
                                if(err){
                                    console.log('Error in logging activity');
                                    console.log(err);
                                }else{
                                    Price.getMailRecipients(addedPriceId, postData, function(err, recipients){
                                        if(err){
                                            next(err);
                                        }else{
                                            res.send({ success: true, msg: "1 price row has been added." });
                                            // MAIL WILL BE SEND IN THE BACKGOUND
                                            let mailRecipients = recipients[0]['mail_recipients'];
                                            let allMailRecipients = mailRecipients.split(',');
                                            // allMailRecipients.push('loknath.g@dimensionindia.com');
                                            let message = `Dear Portal User, <br><br>
                                                Please note a new pricing head "${priceHeadDetail.invoice_item}" has been added for client "${priceHeadDetail.client_name}" with "${priceHeadDetail.price_unit}" as "Unit of Measurement", "${priceHeadDetail.effort_per_unit}" as "Effort Per Unit".
                                                <br><br>
                                                Regards<br><br>
                                                IT Support`;
                                                //console.log(message);
                                                let mailOptions = {
                                                    from: ' "DIN MIS" <noreply@dimensionindia.com>', // sender address
                                                    replyTo: ' "Suport" <suport@dimensionindia.com>', // reply to address
                                                    to: allMailRecipients, // list of receivers
                                                    subject: 'DIN MIS – New Pricing Head Added', // Subject line
                                                    //  text: message, // plain text body
                                                    html: message // html body
                                                };
                                                mail.sendMail(mailOptions, function(err, info){
                                                    if (err) {
                                                        return next(error);
                                                    }else{
                                                        return true;
                                                        //res.send({ success: true, msg: "1 price row has been added." });
                                                    }
                                                }); 
                                                // MAIL WILL BE SEND IN THE BACKGOUND
                                                
                                                //WMS API WOULD BE CALLED IN THE BACKGRUOND
                                                API.callWMSPriceHeadAPI(addedPriceId, 'add');
                                                //API CAL ENDED HERE **********************        
                                        }
                                    });
                                    
                                }
                            });
                        }
                    })
                }
                        
                    }
                });
            }
        }
    });



});

/*edit price by sumana */
router.all('/edit/:id', function (req, res, next) {
  /*  if (req.session.userData.v_usertype != 'SA') {
        res.redirect('http://mis.di.com/welcome.php');
    }*/
    var id = req.params.id;
    postData = req.body;
    //console.log(postData);
    var updateData = {};

    if (postData.start_date) {
        let newDate = postData.start_date.split("-");
        postData.start_date = newDate[2] + '-' + newDate[1] + '-' + newDate[0];


    }
    if (postData.end_date) {
        let newDate = postData.end_date.split("-");
        postData.end_date = newDate[2] + '-' + newDate[1] + '-' + newDate[0];

    }
    if (postData.new_start_date != '') {
        let nDate = postData.new_start_date.split("-");
        postData.new_start_date = nDate[2] + '-' + nDate[1] + '-' + nDate[0];

    }
    //console.log(postData);
    var errMsg = '';
    // else if (postData.account_manager_id == '') {
    //     errMsg += "Please select AM";
    // }
    if (postData.i_empid == '') {
        errMsg += "Please select PM";
    }  else {
        errMsg = '';
    }
    if (errMsg != '') {
        res.send({ success: false, msg: errMsg });
    }

    if(postData.account_manager_id == '' || !postData.account_manager_id){
        postData.account_manager_id = null;
    }
    //set update object
    updateData.i_empid = postData.i_empid;
    updateData.account_manager_id = postData.account_manager_id;
    updateData.end_date = postData.end_date ;
    updateData.price_per_unit = postData.price_per_unit;
    updateData.description = postData.description;
    updateData.billing_cycle = postData.billing_cycle;
    updateData.credit_period = postData.credit_period;
    updateData.effort_per_unit = postData.effort_per_unit;
    updateData.invoice_to = postData.invoice_to;
    updateData.invoice_cc = postData.invoice_cc;
    updateData.invoice_type = postData.invoice_type;
    updateData.client_status = postData.client_status;
    updateData.ao_id = postData.ao_id;
    if(postData.billing_day){
        updateData.billing_day = postData.billing_day;
    }
    
    updateData.modified = new Date();

    if (req.session.userData.isLoggedIn) {
        updateData.modified_by = req.session.userData.id;
    }
    
    var oldUpdateData = {};
    if (postData.new_start_date != '') {
        //let nDate = postData.new_start_date.split("-");
        var d = new Date(postData.new_start_date);
        d.setDate(d.getDate() - 1);
        updateData.end_date = d;
        
        oldUpdateData.end_date =  updateData.end_date;
        oldUpdateData.modified_by = req.session.userData.id;
        oldUpdateData.modified = new Date();
        oldUpdateData.status = 'I';
        updateData = oldUpdateData;
    }

    updateData.approval_status = postData.approval_status;

    // first ro w was updated
    Price.updatePrice(updateData, id, postData.i_clientid,postData.client_status_old,function (err, uniqPrice) {

        // console.log(this.sql);
        var logData = {};
        if(postData.new_am == 'Select Account Manager'){
            postData.new_am = '';
        }
        logData.new_am = postData.new_am;
        logData.old_am = postData.old_am.trim();        
        logData.new_ao = postData.new_ao.trim();
        logData.old_ao = postData.old_ao.trim();
        logData.new_pm = postData.new_pm;
        logData.old_pm = postData.old_pm.trim();
        logData.price_per_unit_old = postData.price_per_unit_old;
        logData.price_per_unit_new = postData.price_per_unit;
        logData.currency_new = postData.currency;
        logData.currency_old = postData.old_currency;
        logData.effort_new = postData.effort_per_unit;
        logData.effort_old = postData.effort_per_unit_old;
        logData.invoice_to_new = postData.invoice_to;
        logData.invoice_to_old = postData.invoice_to_old;
        logData.invoice_cc_new = postData.invoice_cc;
        logData.invoice_cc_old = postData.invoice_cc_old;
        logData.invoice_type_new = postData.invoice_type;
        logData.invoice_type_old = postData.invoice_type_old;
        logData.client_status_new = postData.client_status;
        logData.client_status_old = postData.client_status_old;
        logData.end_date_old = postData.end_date_old;
        logData.end_date_new = postData.end_date;
        logData.price_type_old = postData.price_type_old;
        logData.price_type = postData.price_type;
        logData.approval_status_old = postData.approval_status_old;
        logData.approval_status_new = postData.approval_status;
        logData.price_master_id = postData.id;
        //console.log(logData);
        if (req.session.userData.isLoggedIn) {
            logData.created_by = req.session.userData.id;
            logData.modified_by = req.session.userData.id;

        }
        // set all client blacklisted
        if (postData.new_start_date != '') {
            postData.start_date = postData.new_start_date;
            postData.modified = new Date();
            postData.created = new Date();
            if (req.session.userData.isLoggedIn) {
                postData.created_by = req.session.userData.id;
                postData.modified_by = req.session.userData.id;

            }
            // console.log(postData);
            postData.parent_id = postData.id
            delete postData.new_start_date;
            delete postData.id;
            delete postData.new_am;
            delete postData.new_pm;
            delete postData.old_am;
            delete postData.old_pm;
            delete postData.new_ao;
            delete postData.old_ao;
            delete postData.price_per_unit_old
            delete postData.old_currency;
            delete postData.effort_per_unit_old;
            delete postData.invoice_to_old;
            delete postData.invoice_cc_old;
            delete postData.invoice_type_old;
            delete postData.client_status_old;
            delete postData.end_date_old;
            delete postData.price_type_old;
            delete postData.approval_status_old;
            delete postData.approval_status;
            // console.log(postData);
            //delete postData.old_end_date;
            // insert new row if price has been changed
            if(postData.billing_day == ''){
                postData.billing_day = 0;
            }
            var addedPriceHeadId;
            Price.savePrice(postData, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    if (result.insertId) {
                        addedPriceHeadId = result.insertId;
                        logData.price_master_id = result.insertId;
                        // need old date daily inputs update
                        Delivery.oldInputUpdate(result.insertId, postData, function(err,dResult){
                        if (err) {
                            next(err);
                        } else {
                        Price.savePriceLog(logData,postData.i_clientid, function (err, result) {
                            // console.log(err);
                            if (err) {
                                next(err);
                            } else {
                                
                                Price.getPriceDetail(id, function(err, priceData){
                                    if(err){
                                        next(err);
                                    }else{
                                        let priceHeadDetail = priceData[0];
                                        //console.log("jj"+priceHeadDetail);
                                        let activityData = {
                                            page_url : req.originalUrl,
                                            action : 'Edit',
                                            message : 'Editing the pricing head "'+ priceHeadDetail.invoice_item +'" for client ('+priceHeadDetail.client_name+').',
                                            created : new Date(),
                                            created_by : req.session.userData.id,
                                            requestData : req.body,
                                            modelUsed : 'Price'
                                        }
                                        ActivityLog.logActivity(activityData, function(err, status){
                                            if(err){
                                                console.log('Error in logging activity');
                                                console.log(err);
                                            }else{
                                                //console.log(this.sql);
                                                res.send({ success: true, msg: "1 price row has been updated. 1 price row has been added." });
                                                //WMS API WOULD BE CALLED IN THE BACKGRUOND
                                                API.callWMSPriceHeadAPI(addedPriceHeadId, 'add');
                                                //API CAL ENDED HERE **********************        
                                            }
                                        });
                                    }   
                                });  
                            }
                        });
                    }
                    });
                    } else {
                        Price.getPriceDetail(id, function(err, priceData){
                            if(err){
                                next(err);
                            }else{
                                let priceHeadDetail = priceData[0];
                                // console.log(priceHeadDetail);
                                let activityData = {
                                    page_url : req.originalUrl,
                                    action : 'Edit',
                                    message : 'Editing the pricing head "'+ priceHeadDetail.invoice_item +'" for client ('+priceHeadDetail.client_name+').',
                                    created : new Date(),
                                    created_by : req.session.userData.id,
                                    requestData : req.body,
                                    modelUsed : 'Price'
                                }
                                ActivityLog.logActivity(activityData, function(err, status){
                                    if(err){
                                        console.log('Error in logging activity');
                                        console.log(err);
                                    }else{
                                        //console.log(this.sql);
                                        res.send({ success: true, msg: "1 price row has been updated. 1 price row has been added." });
                                    }
                                });
                            }   
                        });                         
                    }
                }
            });
        } else {
            Price.savePriceLog(logData, postData.i_clientid, function (err, result) {
                console.log(err);
                if (err) {
                    throw err;
                } else {

                    Price.getPriceDetail(id, function(err, priceData){
                        if(err){
                            next(err);
                        }else{
                            let priceHeadDetail = priceData[0];
                            //console.log("KK"+priceHeadDetail);
                            let activityData = {
                                page_url : req.originalUrl,
                                action : 'Edit',
                                message : 'Editing the pricing head "'+ priceHeadDetail.invoice_item +'" for client ('+priceHeadDetail.client_name+').',
                                created : new Date(),
                                created_by : req.session.userData.id,
                                requestData : req.body,
                                modelUsed : 'Price'
                            }
                            ActivityLog.logActivity(activityData, function(err, status){
                                if(err){
                                    console.log('Error in logging activity');
                                    console.log(err);
                                }else{
                                    //console.log(this.sql);
                                    res.send({ success: true, msg: "1 price row has been updated." });
                                    //WMS API WOULD BE CALLED IN THE BACKGRUOND
                                    API.callWMSPriceHeadAPI(id, 'edit');
                                    //API CAL ENDED HERE **********************
                                }
                            });
                        }   
                    }); 
                    

                }
            });

        }
    });




});

/* change status of price by sumana */
router.all('/changeStatus', function (req, res, next) {
    postData = req.body;
    // console.log(postData);
    var updateData = {};
    var errMsg = '';
    var ids = postData.id;
    console.log(ids);
    if (ids == '') {
        var errMsg = 'Please select price.';
        res.send({ success: false, msg: errMsg });
    }
    postData.modified = new Date();
    if (req.session.userData.isLoggedIn) {

        updateData.modified_by = req.session.userData.id;
    }

    updateData.status = postData.batch_action;
    // console.log(updateData);


    Price.updatePrice(updateData, ids, function (err, result) {
        if (err) {
            throw err;
        } else {
            let activityData = {
                page_url : req.originalUrl,
                action : 'Update',
                message : 'Update in status of a price head.',
                created : new Date(),
                created_by : req.session.userData.id,
                requestData : req.body,
                modelUsed : 'Price'
            }
            ActivityLog.logActivity(activityData, function(err, status){
                if(err){
                    console.log('Error in logging activity');
                    console.log(err);
                }else{
                    res.send({ success: true, msg: "Selected price row(s) have been updated." });
                }
            });
        }
    });
});

/* added by sumana 
   listing for account manager */
/*router.all('/accountm', function (req, res, next) {
    //console.log(req);
    /* if(req.session.userData.v_usertype!='SA' || req.session.userData.v_usertype!='AM'){
         res.redirect('http://mis.di.com/welcome.php');
     }*/

  /*  res.render('price/accountm', { moment: moment });



});*/

/*for account manager datatable */
/*router.all('/getAmData', function (req, res, next) {
    /* if(req.session.userData.v_usertype!='SA' || req.session.userData.v_usertype!='AM'){
         res.redirect('http://mis.di.com/welcome.php');
     }*/
    // console.log(req.query);
    /*var condition = {};
    condition.from = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD');
    condition.to = moment(new Date()).format('YYYY-MM-DD');
    if (req.query.from) {
        let fDate = req.query.from.split("-");
        let tDate = req.query.to.split("-");
        condition.from = fDate[2] + '-' + fDate[1] + '-' + fDate[0];
        condition.to = tDate[2] + '-' + tDate[1] + '-' + tDate[0];

        console.log(condition);
    }

    Price.getInvoiceDataAll(condition, function (err, priceList) {
        if (err) {
            throw err;
        } else {
            //  console.log(JSON.stringify(priceList));
            var data = '{"data":' + JSON.stringify(priceList) + "}";
            // res.json(priceList);
            res.send(data);

        }
    });
});*/

/*for price unit autofill */
router.all('/getPriceUnit', function (req, res, next) {
    //console.log(req.body);
    Price.getPriceUnitAll(req.body.term, function (err, priceUnit) {
        if (err) {
            throw err;
        } else {

            
            //console.log(this.sql);
            res.jsonp(priceUnit);

        }
    });
});

router.get('/all_price_heads/(:clientId)', function(req, res, next){
    let clientId = req.params.clientId;
    Price.getAllPriceHeadsByClient(clientId, function(err, priceHeads){

        if(err){
            next(err);
        }else{
            //console.log(this.sql);
            //console.log(priceHeads);
            res.json(priceHeads);
        }
    });
});



module.exports = router;