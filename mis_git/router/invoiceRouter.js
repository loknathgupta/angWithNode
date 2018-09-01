var express = require('express');
var Price = require('../model/priceModel');
var Report = require('../model/reportModel');

var ActivityLog = require('../model/activityLogModel');
var router = express.Router();
var moment = require('moment');
//var config = require('../config');

Date.prototype.getDateLastMonthFrom = function () {
    var dateToReturn = new Date(this.valueOf());
    dateToReturn.setMonth(dateToReturn.getMonth() - 1);
    dateToReturn.setHours(00,00,01);
    return  dateToReturn;
}

Date.prototype.getDateLastMonthTo = function (endingDate) {
    var dateToReturn = new Date(this.valueOf());
    dateToReturn.setDate(dateToReturn.getDate() - 1);
    if(endingDate != ''){
        dateToReturn.setDate(endingDate);
    }
    dateToReturn.setHours(23,58,59);
    return  dateToReturn;
}



/* added by sumana 
   listing for account manager */
router.all('/', function (req, res, next) {
    //console.log(req);
    /* if(req.session.userData.v_usertype!='SA' || req.session.userData.v_usertype!='AM'){
         res.redirect('http://mis.di.com/welcome.php');
     }*/
    var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('MM-YYYY');
    var lastMonth = moment(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)).format('MMM-YYYY');
    var dateSelected = new Date();
    var lastDate = moment(new Date(dateSelected).setDate(dateSelected.getDate() - 1)).format('DD-MM-YYYY');
    var secondLastDate = moment(new Date(dateSelected).setDate(dateSelected.getDate() - 2)).format('DD-MM-YYYY');
    var thirdLastDate = moment(new Date(dateSelected).setDate(dateSelected.getDate() - 3)).format('DD-MM-YYYY');

    let activityData = {
        page_url: req.originalUrl,
        action: 'View',
        message: 'Viewing revenue report.',
        created: new Date(),
        created_by: req.session.userData.id,
        requestData: req.body,
        modelUsed: 'Price'
    }
    ActivityLog.logActivity(activityData, function (err, status) {
        if (err) {
            console.log('Error in logging activity');
            console.log(err);
        } else {
            res.render('invoice/index', { fromDateInitial: fromDateInitial, lastDate: lastDate, secondLastDate: secondLastDate, thirdLastDate: thirdLastDate, lastMonth: lastMonth, moment: moment });
        }
    });



});

/*for account manager datatable */
router.all('/getAmData', function (req, res, next) {
    /* if(req.session.userData.v_usertype!='SA' || req.session.userData.v_usertype!='AM'){
         res.redirect('http://mis.di.com/welcome.php');
     }*/
    // console.log(req.query);
    var condition = {};
    condition.from = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD');
    condition.to = moment(new Date()).format('YYYY-MM-DD');
    condition.month = moment(new Date()).format('MM');
    condition.year = moment(new Date()).format('YYYY');
    if (req.query.from) {
        let fDate = req.query.from.split("-");

        condition.from = fDate[1] + '-' + fDate[0] + '-' + '1';
        condition.to = fDate[1] + '-' + fDate[0] + '-' + '31';

        condition.month = fDate[0]
        condition.year = fDate[1]

    }
    if (condition.month == 1) {
        condition.prevMonth = 12;
        condition.prevYear = condition.year - 1;
    } else {
        condition.prevMonth = condition.month - 1;
        condition.prevYear = condition.year;
    }
    condition.last_month_from = condition.prevYear + '-' + condition.prevMonth + '-' + 1;
    condition.last_month_to = condition.prevYear + '-' + condition.prevMonth + '-' + 31;
    let dateSelected = new Date();
    condition.lastDate = moment(new Date(dateSelected).setDate(dateSelected.getDate() - 1)).format('YYYY-MM-DD');
    condition.secondLastDate = moment(new Date(dateSelected).setDate(dateSelected.getDate() - 2)).format('YYYY-MM-DD');
    condition.thirdLastDate = moment(new Date(dateSelected).setDate(dateSelected.getDate() - 3)).format('YYYY-MM-DD');
    console.log(condition);
    Price.getInvoiceDataAll(condition, function (err, priceList) {
        if (err) {
            throw err;
        } else {
            var ids = [];
            priceList.forEach(function (row) {
                ids.push(row.id);
            });
            Price.getSlabPriceAll(ids, function (err, slabPriceList) {
                if (err) {
                    throw err;
                } else {
                    //console.log(slabPriceList);
                    //  console.log(JSON.stringify(priceList));
                    var finalRes = [];
                    priceList.forEach(function (row) {

                        if (row.price_type == 'S') {
                            var subPrice = [];

                            slabPriceList.forEach(function (sRow) {
                                if (sRow.price_master_id == row.id) {
                                    subPrice.push(sRow);
                                }

                            });


                            if (subPrice.length > 0) {
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

/*for invoice manager */
router.all('/monthlyReport', function (req, res, next) {

    var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('MM-YYYY');
    res.render('invoice/monthly_invoice', { fromDateInitial: fromDateInitial, moment: moment });


});

router.all('/getImData', function (req, res, next) {
    var condition = {};
    condition.from = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM') + '-' + '1';
    condition.to = moment(new Date()).format('YYYY-MM') + '-' + '31';
    condition.month = moment(new Date()).format('MM');
    condition.year = moment(new Date()).format('YYYY');
    condition.invoicedStatus = 0;
    console.log(req.query.from);
    if (req.query.from) {
        let fDate = req.query.from.split("-");

        condition.from = fDate[1] + '-' + fDate[0] + '-' + '1';
        condition.to = fDate[1] + '-' + fDate[0] + '-' + '31';
        condition.invoicedStatus = req.query.not_invoice;
        // if(req.query.not_invoice == 2){

        // }else if(req.query.not_invoice == 1){
        //     condition.to = fDate[1] + '-' + fDate[0] + '-' + '31';
        //     condition.onlyInvoiced = 1;
        // }else{
        //     condition.to ='';
        // }


        condition.month = fDate[0]
        condition.year = fDate[1]
        console.log(condition);
    }
    Report.getInvoiceMonthDataAll(condition, function (err, invoiceDataList) {
        if (err) {
            throw err;
        } else {
            var ids = [];
            invoiceDataList.forEach(function (row) {
                if (row.is_custom != 1) {
                    ids.push(row.id);
                }
            });
            Price.getSlabPriceAll(ids, function (err, slabPriceList) {
                if (err) {
                    throw err;
                } else {
                    //console.log(slabPriceList);
                    //  console.log(JSON.stringify(priceList));
                    var finalRes = [];
                    invoiceDataList.forEach(function (row) {

                        if (row.price_type == 'S') {
                            var subPrice = [];

                            slabPriceList.forEach(function (sRow) {
                                if (sRow.price_master_id == row.id) {
                                    subPrice.push(sRow);
                                }

                            });


                            if (subPrice.length > 0) {
                                row.slab_price = subPrice;

                            }

                        }
                        finalRes.push(row);
                    })
                    // console.log(finalRes);
                    var data = '{"data":' + JSON.stringify(finalRes) + "}";
                    // res.json(priceList);
                    res.send(data);

                }
            });

        }
    });
});
router.all('/invoiceNumber/(:addNew)', function (req, res, next) {
    var addNew = req.params.addNew;
    //console.log(addNew);
    var id = req.query.id;
    //console.log('++++++++++++++'+id);
    condition = {};
    invoiceDetail = {};
    var idArr = id.split("_");
    //console.log(idArr);
    condition.price_master_id = idArr[0];
    condition.month = idArr[2];
    condition.year = idArr[3];
    condition.isCustom = idArr[4];
    Report.getMonthlyInvoice(condition, function (err, invoiceDetail) {
        if (err) {
            throw err;
        } else {
            //console.log("newsql-----------"+this.sql);
            if (addNew == 1) {
                id = 0;
            }
            // console.log( id);
            res.render('invoice/addInvoiceNumber', { invoiceDetail: invoiceDetail, id: id, addNew: addNew, moment: moment });
        }
    });


});


router.all('/saveInvoiceReport', function (req, res, next) {
    /* if(req.session.userData.v_usertype!='SA' || req.session.userData.v_usertype!='AM'){
         res.redirect('http://mis.di.com/welcome.php');
     }*/
    console.log(req.query);
    var postData = req.body;
    //console.log(postData);
    condition = {};
    if (postData.from_date) {
        let fDate = postData.from_date.split("-");

        condition.from = fDate[1] + '-' + fDate[0] + '-' + '1';
        condition.to = fDate[1] + '-' + fDate[0] + '-' + '31';
        condition.month = fDate[0]
        condition.year = fDate[1]
        //console.log(condition);
    }
    postData.modified = new Date();
    postData.created = new Date();
    postData.modified = moment(postData.modified).format('YYYY-MM-DD');
    postData.created = moment(postData.created).format('YYYY-MM-DD');
    var ids = [];
    var customOrStandardStatus = [];
    var month = '';
    var year = '';
    var client_id = '';
    var isCustom;
    if (Array.isArray(postData.price_id)) {
        for (var i = 0; i < postData.price_id.length; i++) {
            var dataArr = postData.price_id[i].split('_');
            ids.push(dataArr[0]);
            client_id = dataArr[1];
            month = dataArr[2];
            year = dataArr[3];
            isCustom = dataArr[4];
            if (isCustom == 1) {
                customOrStandardStatus.push('C');
            } else {
                customOrStandardStatus.push('S');
            }

        }
        // console.log(ids);
    } else {
        var dataArr = postData.price_id.split('_');
        ids.push(dataArr[0]);
        client_id = dataArr[1];
        month = dataArr[2];
        year = dataArr[3];
        isCustom = dataArr[4];
        if (isCustom == 1) {
            customOrStandardStatus.push('C');
        } else {
            customOrStandardStatus.push('S');
        }
    }
    postData.ids = ids;
    postData.month = month;
    postData.year = year;
    postData.client_id = client_id;
    postData.customOrStandardStatus = customOrStandardStatus;
    if (req.session.userData.isLoggedIn) {
        postData.created_by = req.session.userData.id;
        postData.modified_by = req.session.userData.id;
    }
    // console.log(postData);

    // console.log(dataList);
    Report.addInvoiceNumber(condition, postData, function (err, result) {
        if (err) {
            throw err;
        } else {
            Price.getPriceHeads(postData.ids, function (err, priceHeadData) {
                if (err) {
                    next(err);
                } else {
                    let priceHeadDetails = priceHeadData[0];
                    let activityData = {
                        page_url: req.originalUrl,
                        action: 'Add',
                        message: 'Adding ' + postData.invoice_number + ' as invoice number and ' + postData.invoice_date + ' as invoice date for pricing head ' + priceHeadDetails.pricingHeads + '.',
                        created: new Date(),
                        created_by: req.session.userData.id,
                        requestData: req.body,
                        modelUsed: 'Price'
                    }
                    ActivityLog.logActivity(activityData, function (err, status) {
                        if (err) {
                            console.log('Error in logging activity');
                            console.log(err);
                        } else {

                            res.send({ success: true, msg: "Data saved successfully." });

                        }
                    });
                }
            })

        }
    });

    // }
    // });

});


router.all('/updateInvoiceReport', function (req, res, next) {

    var postData = req.body;

    postData.modified = new Date();
    postData.created = new Date();
    postData.modified = moment(postData.modified).format('YYYY-MM-DD');
    postData.created = moment(postData.created).format('YYYY-MM-DD');

    if (req.session.userData.isLoggedIn) {
        postData.created_by = req.session.userData.id;
        postData.modified_by = req.session.userData.id;
    }
    priceIdArr = postData.price_id.split("_");
    priceId = priceIdArr[0];

    console.log(postData);
    Report.updateInvoiceNumber(postData, function (err, result) {
        if (err) {
            throw err;
        } else {
            Price.getPriceHeads(priceId, function (err, priceHeadData) {
                if (err) {
                    next(err);
                } else {
                    let priceHeadDetails = priceHeadData[0];
                    let activityData = {
                        page_url: req.originalUrl,
                        action: 'Edit',
                        message: 'Updating ' + postData.invoice_number + ' as invoice number and ' + postData.invoice_date + ' as invoice date for pricing head ' + priceHeadDetails.pricingHeads + '.',
                        created: new Date(),
                        created_by: req.session.userData.id,
                        requestData: req.body,
                        modelUsed: 'Price'
                    }
                    ActivityLog.logActivity(activityData, function (err, status) {
                        if (err) {
                            console.log('Error in logging activity');
                            console.log(err);
                        } else {

                            res.send({ success: true, msg: "Data saved successfully." });

                        }
                    });
                }
            })

        }
    });

    // }
    // });

});

router.all('/viewSlabPrice', function (req, res, next) {

    var price_master_id = req.query.id;
    var ids = [];
    ids.push(price_master_id);
    Price.getSlabPriceAll(ids, function (err, priceSlabDetail) {
        if (err) {
            throw err;
        } else {
            // console.log("newsql-----------"+this.sql);
            res.render('invoice/viewSlabPrice', { priceSlabDetail: priceSlabDetail, id: price_master_id, moment: moment });
        }
    })



});

/*revenue report summary */
router.all('/revenueByClient', function (req, res, next) {

    var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('MM-YYYY');
    res.render('invoice/revenue_summary', { fromDateInitial: fromDateInitial, moment: moment });


});

// revenue report summary
router.all('/revenueByClientData', function (req, res, next) {

    var condition = {};
    condition.from = moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD');
    condition.to = moment(new Date()).format('YYYY-MM-DD');
    condition.month = moment(new Date()).format('MM');
    condition.year = moment(new Date()).format('YYYY');
    var todate = new Date().getDate();
    var endingDate = todate;
    //console.log(req.query);
    if(req.query.reporttype && req.query.reporttype!='mtd'){
        todate = 31;  
        endingDate = '';  
    }
    if (req.query.from) {
        let fDate = req.query.from.split("-");

        condition.from = fDate[1] + '-' + fDate[0] + '-' + '1';
        
        condition.to = fDate[1] + '-' + fDate[0] + '-' + todate;

        condition.month = fDate[0]
        condition.year = fDate[1]

    }

    var selectedMonthFrom = new Date(condition.from);


    var lastMonthFrom = selectedMonthFrom.getDateLastMonthFrom();
    var lastMonthTo = selectedMonthFrom.getDateLastMonthTo(endingDate);

    var secondLastMonthFrom = lastMonthFrom.getDateLastMonthFrom();
    var secondLastMonthTo = lastMonthFrom.getDateLastMonthTo(endingDate);

    var thirdLastMonthFrom = secondLastMonthFrom.getDateLastMonthFrom();
    var thirdLastMonthTo = secondLastMonthFrom.getDateLastMonthTo(endingDate);

    var fourthLastMonthFrom = thirdLastMonthFrom.getDateLastMonthFrom();
    var fourthLastMonthTo = thirdLastMonthFrom.getDateLastMonthTo(endingDate);

    var fifthLastMonthFrom = fourthLastMonthFrom.getDateLastMonthFrom();
    var fifthLastMonthTo = fourthLastMonthFrom.getDateLastMonthTo(endingDate);

    // last month    
    condition.last_month_from = moment(lastMonthFrom).format('YYYY-MM-DD');
    condition.last_month_to = moment(lastMonthTo).format('YYYY-MM-DD HH:mm:ss');

    //second last month
    condition.second_last_month_from = moment(secondLastMonthFrom).format('YYYY-MM-DD');
    condition.second_last_month_to = moment(secondLastMonthTo).format('YYYY-MM-DD HH:mm:ss');

    //second last month
    condition.third_last_month_from = moment(thirdLastMonthFrom).format('YYYY-MM-DD');
    condition.third_last_month_to = moment(thirdLastMonthTo).format('YYYY-MM-DD HH:mm:ss');

    //second last month
    condition.fourth_last_month_from = moment(fourthLastMonthFrom).format('YYYY-MM-DD');
    condition.fourth_last_month_to = moment(fourthLastMonthTo).format('YYYY-MM-DD HH:mm:ss');

    //second last month
    condition.fifth_last_month_from = moment(fifthLastMonthFrom).format('YYYY-MM-DD');
    condition.fifth_last_month_to = moment(fifthLastMonthTo).format('YYYY-MM-DD HH:mm:ss');
    
    //console.log(condition);
    Report.getInvoiceDataForClient(condition, function (err, priceList) {
        if (err) {
            
            throw err;
        } else {
            
            var ids = [];
            priceList.forEach(function (row) {
                ids.push(row.id);
            });
            var clientIds = []
            priceList.forEach(function (row) {
                clientIds.push(row.i_clientid);
            });
           // console.log(clientIds);
            clientIds = clientIds.filter(configuration.onlyUnique);
            //console.log(clientIds);
            Price.getSlabPriceAll(ids, function (err, slabPriceList) {
                if (err) {
                    throw err;
                } else {
                    //console.log(slabPriceList);
                    //  console.log(JSON.stringify(priceList));
                    var finalRes = [];
                    priceList.forEach(function (row) {

                        if (row.price_type == 'S') {
                            var subPrice = [];

                            slabPriceList.forEach(function (sRow) {
                                if (sRow.price_master_id == row.id) {
                                    subPrice.push(sRow);
                                }

                            });


                            if (subPrice.length > 0) {
                                row.slab_price = subPrice;

                            }

                        }
                        finalRes.push(row);
                    })


                    var displayList = [];

                    for(var i=0; i<clientIds.length;i++) {
                        var amtTotal = 0;
                        var prevamount = 0;
                        var secondPrevAmt = 0;
                        var thirdPrevAmt = 0;
                        var fourthPrevAmt = 0;
                        var fifthPrevAmt = 0;
                        var disRow = {};
                        finalRes.forEach(function (row) {
                            if (clientIds[i] == row.i_clientid) {
                                disRow.client_name = row.client_name;
                                disRow.currency = row.currency;
                                var amt = amt2 = amt3 = amt4 = amt5 = amt6 = 0;
                                //this month amount
                                if (row.price_type == 'F') {
                                    amt = parseFloat(row.price_per_unit * row.volume).toFixed(2);
                                } else {
                                    amt = configuration.getSlabAmount(row.slab_price, row.volume);
                                }
                                amtTotal = (parseFloat(amtTotal) + parseFloat(amt)).toFixed(2);

                                // last month amount
                                if (row.price_type == 'F') {
                                    amt2 = (parseFloat(row.price_per_unit * row.last_month_volume)).toFixed(2) ;
                                } else {
                                    amt2 = configuration.getSlabAmount(row.slab_price, row.last_month_volume);
                                }
                                amt2 = (parseFloat(amt2)+ row.last_month_custom_amt).toFixed(2);
                                prevamount = (parseFloat(prevamount) + parseFloat(amt2)).toFixed(2);

                                // last to last month amount
                                if (row.price_type == 'F') {
                                    amt3 = parseFloat(row.price_per_unit * row.second_last_month_volume).toFixed(2);
                                } else {
                                    amt3 = configuration.getSlabAmount(row.slab_price, row.second_last_month_volume);
                                }
                                amt3 = (parseFloat(amt3)+ row.second_last_month_custom_amt).toFixed(2);
                                secondPrevAmt = (parseFloat(secondPrevAmt) + parseFloat(amt3)).toFixed(2);


                                // third last month amount
                                if (row.price_type == 'F') {
                                    amt4 = parseFloat(row.price_per_unit * row.third_last_month_volume).toFixed(2);
                                } else {
                                    amt4 = configuration.getSlabAmount(row.slab_price, row.third_last_month_volume);
                                }
                                amt4 = (parseFloat(amt4)+ row.third_last_month_custom_amt).toFixed(2);
                                thirdPrevAmt = (parseFloat(thirdPrevAmt) + parseFloat(amt4)).toFixed(2);

                                // fourth last month amount
                                if (row.price_type == 'F') {
                                    amt5 = parseFloat(row.price_per_unit * row.fourth_last_month_volume).toFixed(2);
                                } else {
                                    amt5 = configuration.getSlabAmount(row.slab_price, row.fourth_last_month_volume);
                                }
                                amt5 = (parseFloat(amt5)+ row.fourth_last_month_custom_amt).toFixed(2);
                                fourthPrevAmt = (parseFloat(fourthPrevAmt) + parseFloat(amt5)).toFixed(2);

                                // fifth last month amount
                                if (row.price_type == 'F') {
                                    amt6 = parseFloat(row.price_per_unit * row.fifth_last_month_volume).toFixed(2);
                                } else {
                                    amt6 = configuration.getSlabAmount(row.slab_price, row.fifth_last_month_volume);
                                }
                                amt6 = (parseFloat(amt6)+ row.fifth_last_month_custom_amt).toFixed(2);
                                fifthPrevAmt = (parseFloat(fifthPrevAmt) + parseFloat(amt6)).toFixed(2);
                            }
                        });
                        disRow.fifth_last_month_ammount = fifthPrevAmt;
                        disRow.fourth_last_month_ammount = fourthPrevAmt;
                        disRow.third_last_month_ammount = thirdPrevAmt;
                        disRow.second_last_month_ammount = secondPrevAmt;
                        disRow.last_month_ammount = prevamount;
                        disRow.ammount = amtTotal;
                        displayList.push(disRow);
                    }
                   // console.log(displayList);
                    var data = '{"data":' + JSON.stringify(displayList) + "}";
                    // res.json(priceList);
                    res.send(data);
                }



            
            });

}
    });
});

/*revenue report summary */
router.all('/revenueByClientDays', function (req, res, next) {
    var condition = {};
    var toDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-1)).format('YYYY-MM-DD');
    var fromDateInitial = moment(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-4)).format('YYYY-MM-DD');
    condition.from = fromDateInitial;
    condition.to = toDateInitial;
    var displayList = [];
    console.log(req);
    if (req.body.from ) {
        let fDate = req.body.from.split("-");
        let tDate = req.body.to.split("-");
    
        condition.from = fDate[2] + '-' + fDate[1] + '-' + fDate[0];
        
        condition.to = tDate[2] + '-' + tDate[1] + '-' + tDate[0];
        toDateInitial = condition.to;
        fromDateInitial = condition.from;

    }
    console.log(fromDateInitial);
    console.log(toDateInitial);
    Report.getInvoiceDataForClientDays(condition, function (err, priceList) {
        if (err) {
            
            throw err;
        } else {
           // console.log(this.sql);
            var ids = [];
            priceList.forEach(function (row) {
                ids.push(row.id);
            });
            var clientIds = []
            priceList.forEach(function (row) {
                clientIds.push(row.i_clientid);
            });
           // console.log(clientIds);
            clientIds = clientIds.filter(configuration.onlyUnique);
            //console.log(clientIds);
            Price.getSlabPriceAll(ids, function (err, slabPriceList) {
                if (err) {
                    throw err;
                } else {
                    //console.log(slabPriceList);
                    //  console.log(JSON.stringify(priceList));
                    var finalRes = [];
                    priceList.forEach(function (row) {

                        if (row.price_type == 'S') {
                            var subPrice = [];

                            slabPriceList.forEach(function (sRow) {
                                if (sRow.price_master_id == row.id) {
                                    subPrice.push(sRow);
                                }

                            });


                            if (subPrice.length > 0) {
                                row.slab_price = subPrice;

                            }

                        }
                        finalRes.push(row);
                    })

//console.log(finalRes);
                    

                    for(var i=0; i<clientIds.length;i++) {
                        var amtTotal = 0;
                        
                        var disRow = {};
                        var amtArr =[];
                        finalRes.forEach(function (row) {
                            if (clientIds[i] == row.i_clientid) {
                                disRow.client_name = row.client_name;
                                disRow.currency = row.currency;
                               
                               
                                
                               
                                        if (row.price_type == 'F') {
                                            amt = parseFloat(row.price_per_unit * row.volume).toFixed(2);
                                        } else {
                                            amt = configuration.getSlabAmount(row.slab_price, row.volume);
                                        }
                                       // console.log(amtArr.length);
                                        if(amtArr.length>0){
                                            var insert = false;
                                            for(var j =0 ;j<amtArr.length ; j++){
                                                //console.log(amtArr[j].date_display);
                                                if(moment(amtArr[j].date_display).format("YYYY-MM-DD")==moment(row.d_date).format("YYYY-MM-DD")){
                                                   // console.log(amtArr[j].amt);
                                                    amtArr[j].amt = parseFloat(amtArr[j].amt) + parseFloat(amt);
                                                    insert = true;
                                                }
                                            }
                                            if(!insert){
                                                
                                                    amtArr.push({"client":row.i_clientid,"date_display":moment(row.d_date).format("YYYY-MM-DD"),"amt":amt});
                                                
                                            }
                                        }else{
                                            amtArr.push({"client":row.i_clientid,"date_display":moment(row.d_date).format("YYYY-MM-DD"),"amt":amt}); 
                                        } 
                                     // console.log(amtArr);
                                        
                                
                                //this month amount
                                

                               
                            }
                            
                        });
                      // if(i>2) break;
                       // console.log(amtArr);
                        disRow.amtArr = amtArr;
                        
                        displayList.push(disRow);
                    }
                   // console.log(displayList);
                    
                  //  console.log(Array.isArray(displayList));

                  //  var data = '{"data":' + JSON.stringify(displayList) + "}";
                    // res.json(priceList);
                    res.render('invoice/revenue_summary_days', { fromDateInitial:fromDateInitial,toDateInitial:toDateInitial, displayList:displayList,moment: moment });
                }



            
            });

}
    });
   


});




module.exports = router;