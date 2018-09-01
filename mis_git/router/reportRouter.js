var express = require('express');
var Report = require('../model/reportModel');
var Price = require('../model/priceModel');
var ActivityLog = require('../model/activityLogModel');
var router = express.Router();
var moment = require('moment');


/* added by sumana 
   monthly revenue report */
router.all('/', function (req, res, next) {

   
    let activityData = {
        page_url : req.originalUrl,
        action : 'View',
        message : 'Viewing projected vs actual volume report.',
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
            var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format( 'MM-YYYY');
            //var toDateInitial = moment(new Date()).format( 'DD-MM-YYYY');
            res.render('report/index', {fromDateInitial:fromDateInitial,  moment: moment });
        }
    });

});

/*for monthly projected dv actual volume */
router.all('/getMonthlyData', function (req, res, next) {
    /* if(req.session.userData.v_usertype!='SA' || req.session.userData.v_usertype!='AM'){
         res.redirect('http://mis.di.com/welcome.php');
     }*/
    // console.log(req.query);
    var condition ={};
    condition.from = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format( 'YYYY-MM')+'-'+'1';
    condition.to =  moment(new Date()).format( 'YYYY-MM')+'-'+'31';
    condition.month = moment(new Date()).format( 'MM');
    condition.year = moment(new Date()).format( 'YYYY');
    console.log(req.query.from);
    if(req.query.from){
        let fDate = req.query.from.split("-");
        
        condition.from = fDate[1]+'-'+fDate[0]+'-'+'1';
        condition.to = fDate[1]+'-'+fDate[0]+'-'+'31';
        condition.month =fDate[0];
        condition.year = fDate[1];
        console.log(condition);
    }
    condition.user_type = req.session.userData.v_usertype;
    condition.user_id = req.session.userData.id;
   // console.log(condition)
    Report.getMonthlyRevenue(condition,function (err, priceList) {
        if (err) {
            throw err;
        } else {
            var ids=[];
            priceList.forEach(function(row){
                ids.push(row.id);
            });
            Price.getSlabPriceAll(ids, function (err, slabPriceList) {
                if (err) {
                    throw err;
                } else {
                    //console.log(slabPriceList);
                    //  console.log(JSON.stringify(priceList));
                    var finalRes =[];
                    priceList.forEach(function(row){
                        
                        if(row.price_type=='S'){
                            var subPrice = [];
                           
                            slabPriceList.forEach(function(sRow){
                                  if(sRow.price_master_id == row.id){
                                    subPrice.push(sRow);
                                  }
                                  
                            });

                            
                            if(subPrice.length>0){
                                row.slab_price = subPrice;
                                
                            }

                        }
                        finalRes.push(row);
                    })
                    //console.log(finalRes);
                    var data = '{"data":' + JSON.stringify(finalRes) + "}";
                    // res.json(priceList);
                    res.send(data);
        
                }
            });

        }
    });
});

/* peojected vs actual monthly voulume report */
router.all('/projected_volume', function (req, res, next) {

    
            var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format( 'MM-YYYY');
            //var toDateInitial = moment(new Date()).format( 'DD-MM-YYYY');
            res.render('report/volume', {fromDateInitial:fromDateInitial,  moment: moment });
        

});


/* peojected vs actual monthly amount report */

router.all('/amount_report', function (req, res, next) {
    var condition ={};
    condition.from = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format( 'YYYY-MM')+'-'+'1';
    condition.to =  moment(new Date()).format( 'YYYY-MM')+'-'+'31';
    condition.month = moment(new Date()).format( 'MM');
    condition.year = moment(new Date()).format( 'YYYY');
    //console.log(req.body.from);
    var fromDateInitial = moment(condition.from).format('MM-YYYY');
    if(req.body.from){
        fromDateInitial = req.body.from;
        let fDate = req.body.from.split("-");        
        condition.from = fDate[1]+'-'+fDate[0]+'-'+'1';
        condition.to = fDate[1]+'-'+fDate[0]+'-'+'31';
        condition.month =fDate[0];
        condition.year = fDate[1];
        console.log(condition);
    }
    condition.user_type = req.session.userData.v_usertype;
    condition.user_id = req.session.userData.id;
    condition.includeLastMonthVolume = 1;
   // console.log(condition)
    Report.getMonthlyRevenue(condition,function (err, priceList) {
        if (err) {
            throw err;
        } else {
            var priceHeads=[];
            var clients = [];
            priceList.forEach(function(row){
                priceHeads.push(row.id);
                clients.push(row.i_clientid);
            });
            // console.log(clients);
            clients = clients.filter(configuration.onlyUnique);
            // console.log(clients);


            Price.getSlabPriceAll(priceHeads, function (err, slabPriceList) {
                if (err) {
                    throw err;
                } else {
                    //console.log(slabPriceList);
                    //  console.log(JSON.stringify(priceList));
                    var finalRes =[];
                    priceList.forEach(function(row){
                        
                        if(row.price_type=='S'){
                            var subPrice = [];
                           
                            slabPriceList.forEach(function(sRow){
                                  if(sRow.price_master_id == row.id){
                                    subPrice.push(sRow);
                                  }
                                  
                            });

                            
                            if(subPrice.length>0){
                                row.slab_price = subPrice;
                                
                            }

                        }
                        finalRes.push(row);
                    });

                    var dataToDisplay = [];

                    for(var i=0; i<clients.length;i++) {
                        var clientData = {};
                        var projectedAmountForClient = 0;
                        var actualAmountForClient = 0;
                        var lastMonthAmountForClient = 0;
                        finalRes.forEach(function (row) {
                            if (clients[i] == row.i_clientid) {
                                clientData.client_name = row.client_name;
                                clientData.currency = row.currency;
                                var priceHeadProjectedAmount = 0;
                                var priceHeadActualAmount = 0;
                                var lastMonthActualAmount = 0;
                                if (row.price_type == 'F') {
                                    priceHeadProjectedAmount = parseFloat(row.price_per_unit * row.volume_pm).toFixed(2);
                                    priceHeadActualAmount = parseFloat(row.price_per_unit * row.volume_actual).toFixed(2);
                                    lastMonthActualAmount = parseFloat(row.price_per_unit * row.last_month_volume_actual).toFixed(2);
                                } else {
                                    priceHeadProjectedAmount = configuration.getSlabAmount(row.slab_price, row.volume_pm);
                                    priceHeadActualAmount = configuration.getSlabAmount(row.slab_price, row.volume_actual);
                                    lastMonthActualAmount = configuration.getSlabAmount(row.slab_price, row.last_month_volume_actual);
                                }
                                projectedAmountForClient = (parseFloat(projectedAmountForClient) + parseFloat(priceHeadProjectedAmount)).toFixed(2);
                                actualAmountForClient = (parseFloat(actualAmountForClient) + parseFloat(priceHeadActualAmount)).toFixed(2);
                                lastMonthAmountForClient = (parseFloat(lastMonthAmountForClient) + parseFloat(lastMonthActualAmount)).toFixed(2);
                                clientData.projectedAmount = projectedAmountForClient;
                                clientData.actualAmount = actualAmountForClient;
                                clientData.lastMonthActualAmount = lastMonthAmountForClient;
                            }
                        });
                        dataToDisplay.push(clientData);

                    }

                    // console.log(dataToDisplay);
                    res.render('report/amount', {
                        dataToDisplay:dataToDisplay,
                        moment: moment,
                        fromDateInitial:fromDateInitial 
                    });
                }
            });

        }
    });
});




module.exports = router;