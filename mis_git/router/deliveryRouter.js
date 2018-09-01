var express = require('express');
var Delivery = require('../model/deliveryModel');
var MonthlyDelivery = require('../model/monthlyDeliveryModel');
var DeliveryChangeRequest = require('../model/deliveryChangeRequestModel');
var Employee = require('../model/employeeModel');
var User = require('../model/userModel');
var CustomPrice = require('../model/customPriceModel');
var Price = require('../model/priceModel');
var DeliverableSortOrder = require('../model/deliverableSortOrderModel');
var ActivityLog = require('../model/activityLogModel');
var FileUploader = require('../middleware/fileUploader');
var FS = require('fs');
var router = express.Router();
var moment = require('moment');
var url = require('url');
var API = require('../model/apiModel');

/* added by sumana 
   listing for price */

router.get('/adjust_missing_values', function(req, res, next){    
    Delivery.insertDefaultForSuspendedHeads();
    res.send('Missing values for price heads adjusted.');
});

router.all('/', function (req, res, next) {
    
    dateCurrent = new Date(moment(new Date()).format('YYYY-MM-DD'));
    let dateSelected = new Date();
    dateSelected.setDate(dateSelected.getDate() - 1);
    let customPriceHeads;

    if (req.body.delivery_for) {
        let dateParts = req.body.delivery_for.split('-');
        let actualDate = dateParts[0];
        let actualMonth = dateParts[1];
        let actualYear = dateParts[2];
        //dateSelected = new Date(actualYear, actualMonth, actualDate);
        //dateSelected = moment(dateSelected).format('YYYY-MM-DD');
        dateSelected = actualYear + '-' + actualMonth + '-' + actualDate;
        dateSelected = new Date(dateSelected);

    }
    dateSelected = new Date(dateSelected);

    let dateDiff = Math.floor((dateCurrent.getTime() - dateSelected.getTime()) / (1000 * 3600 * 24));


    let lastmonthDate = new Date(dateSelected).setMonth(dateSelected.getMonth() - 1);
    let lastDate = new Date(dateSelected).setDate(dateSelected.getDate() - 1);
    let secondLastDate = new Date(dateSelected).setDate(dateSelected.getDate() - 2);
    let thirdLastDate = new Date(dateSelected).setDate(dateSelected.getDate() - 3);
    dateSelected = moment(dateSelected).format('YYYY-MM-DD');
    lastDate = moment(lastDate).format('YYYY-MM-DD');
    secondLastDate = moment(secondLastDate).format('YYYY-MM-DD');
    thirdLastDate = moment(thirdLastDate).format('YYYY-MM-DD');
    let oneMonthOldDate = moment(lastmonthDate).format('YYYY-MM-DD');
    let projectManagerId = accountManagerId = 0;
    let hasAccessUpTo = req.session.userData.hasAccessUpTo;
    if (req.body.project_manager_id && req.body.project_manager_id != '') {
        projectManagerId = req.body.project_manager_id;
    } else if (req.session.userData.v_usertype.indexOf('PM') != -1) {
        projectManagerId = req.session.userData.id;
    } else if (req.session.userData.v_usertype.indexOf('SA') != -1 || req.session.userData.v_usertype.indexOf('IM') != -1 || req.session.userData.v_usertype.indexOf('AO') != -1) {
        projectManagerId = 0;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    let clientStatus = '1';
    if (req.body.client_status && req.body.client_status != '') {
        clientStatus = req.body.client_status;
    }
    let priceHeadStatus = '0';
    if (req.body.price_head_status && req.body.price_head_status != '') {
        priceHeadStatus = req.body.price_head_status;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    let inputRestriction = false;

    // console.log("gghg"+hasAccessUpTo);
    let isexpiredDate = isOldDeliverables = 0;
    // console.log(dateDiff);
    if (dateDiff >= 5 && inputRestriction) {
        isexpiredDate = 1;
    }
    let retrievalRole = 'PM';
    let requestData = {
        dateSelected: dateSelected,
        lastDate: lastDate,
        secondLastDate: secondLastDate,
        thirdLastDate: thirdLastDate,
        oneMonthOldDate: oneMonthOldDate,
        projectManagerId: projectManagerId,
        accountManagerId: accountManagerId,
        retrievalRole: retrievalRole,
        clientStatus: clientStatus,
        priceHeadStatus: priceHeadStatus
    };
    Delivery.getPriceForDeliverable(requestData, req.session.userData, function (err, priceList) {
        if (err) {
            console.log("Error on retrieving Delivery items....");
            console.log(err);
            next(err);
        } else {
            CustomPrice.getCustomPriceHeadsForMonth(requestData)
            .then(function(priceHeads){
                customPriceHeads = priceHeads;
            })
            .catch(function(data){
                console.log(data);
            });
            // console.log(this.sql);
            Delivery.checkDeliverableForDate(requestData.dateSelected, requestData.projectManagerId, function (err, deliverablesOfDate) {
                if (err) {
                    console.log("Error on retrieving deliverable for the date....");
                    console.log(err);
                    next(err);
                } else {
                   // console.log(deliverablesOfDate[0]['addedDeliverables']);
                    
                    var totalInput = 0;
                    var suspended = 0;
                    priceList.forEach(function(row){
                        if(row.status!='S' && row.client_status!=2 && row.is_custom!=1){
                            totalInput++; 
                        }
                    })
                    // console.log(deliverablesOfDate[0]['addedDeliverables']);
                    // console.log(totalInput);
                    if (deliverablesOfDate[0]['addedDeliverables'] == totalInput) {
                        isOldDeliverables = 1;
                    }

                    //console.log(req.session.userData.v_usertype);
                    let HigherMangerId = req.session.userData.id;
                    if (hasAccessUpTo == 'All') {
                        HigherMangerId = 0;
                    }
                    // console.log(req.session.userData.v_usertype);
                    Employee.getPMByHigherManger(HigherMangerId, req.session.userData.v_usertype, function (err, projectManagers) {
                        if (err) {
                            console.log("Error on retrieving project managers....");
                            console.log(err);
                            next(err);
                        } else {
                            // console.log(hasAccessUpTo);
                            // console.log(projectManagers);
                            let managersToReturn = [];
                            if (hasAccessUpTo == 'PM') {
                                projectManagers.forEach(function (manager) {
                                    if (manager.id == req.session.userData.id) {
                                        managersToReturn.push(manager);
                                    }
                                });
                            } else {
                                managersToReturn = projectManagers;
                            }
                            let q = url.parse(req.url, true);
                            let activityData = {
                                page_url: req.originalUrl,
                                action: 'View',
                                message: 'Viewing daily deliverables.',
                                created: new Date(),
                                created_by: req.session.userData.id,
                                requestData: req.body,
                                modelUsed: 'Delivery'
                            }

                            ActivityLog.logActivity(activityData, function (err, status) {
                                if (err) {
                                    console.log('Error in logging activity');
                                    console.log(err);
                                    next(err);
                                } else {
                                    if ((hasAccessUpTo == 'PM' || hasAccessUpTo == 'AM') && req.session.userData.id == projectManagerId) {
                                        inputRestriction = true;
                                        hasAccessUpTo = 'PM';
                                    }
                                    //console.log(customPriceHeads);
                                    res.render('deliverable/index', {
                                        priceList: priceList,
                                        dateData: requestData,
                                        isOldDeliverables: isOldDeliverables,
                                        managers: managersToReturn,
                                        isexpiredDate: isexpiredDate,
                                        loggedInUserType: req.session.userData.v_usertype,
                                        moment: moment,
                                        retrievalRole: retrievalRole,
                                        hasAccessUpTo: hasAccessUpTo,
                                        PMOfSelectedAM: [],
                                        customPriceHeads : customPriceHeads
                                    });
                                }
                            });

                        }
                    })
                
        }
    });
        }
    });

});



router.all('/account_manager', function (req, res, next) {
    dateCurrent = new Date(moment(new Date()).format('YYYY-MM-DD'));
    let dateSelected = new Date();
    dateSelected.setDate(dateSelected.getDate() - 1);
    let customPriceHeads;
    if (req.body.delivery_for) {
        let dateParts = req.body.delivery_for.split('-');
        let actualDate = dateParts[0];
        let actualMonth = dateParts[1];
        let actualYear = dateParts[2];
        //dateSelected = new Date(actualYear, actualMonth, actualDate);
        //dateSelected = moment(dateSelected).format('YYYY-MM-DD');
        dateSelected = actualYear + '-' + actualMonth + '-' + actualDate;
        dateSelected = new Date(dateSelected);

    }
    dateSelected = new Date(dateSelected);

    let dateDiff = Math.floor((dateCurrent.getTime() - dateSelected.getTime()) / (1000 * 3600 * 24));
    let isexpiredDate = isOldDeliverables = 0;
    isOldDeliverables = 1; //Page will always be open in read-only mode

    let lastmonthDate = new Date(dateSelected).setMonth(dateSelected.getMonth() - 1);
    let lastDate = new Date(dateSelected).setDate(dateSelected.getDate() - 1);
    let secondLastDate = new Date(dateSelected).setDate(dateSelected.getDate() - 2);
    let thirdLastDate = new Date(dateSelected).setDate(dateSelected.getDate() - 3);
    dateSelected = moment(dateSelected).format('YYYY-MM-DD');
    lastDate = moment(lastDate).format('YYYY-MM-DD');
    secondLastDate = moment(secondLastDate).format('YYYY-MM-DD');
    thirdLastDate = moment(thirdLastDate).format('YYYY-MM-DD');
    let oneMonthOldDate = moment(lastmonthDate).format('YYYY-MM-DD');
    let projectManagerId = 0;
    let accountManagerId = 'All';
    let hasAccessUpTo = req.session.userData.hasAccessUpTo;

    if (req.body.account_manager_id && req.body.account_manager_id != '') {
        accountManagerId = req.body.account_manager_id;
    } else if (req.session.userData.v_usertype.indexOf('AM') != -1) {
        accountManagerId = req.session.userData.id;
    } else if (req.session.userData.v_usertype.indexOf('SA') != -1 || req.session.userData.v_usertype.indexOf('IM') != -1 || req.session.userData.v_usertype.indexOf('AO') != -1) {
        accountManagerId = 'All';
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    let clientStatus = '1';
    if (req.body.client_status && req.body.client_status != '') {
        clientStatus = req.body.client_status;
    }
    let priceHeadStatus = '0';
    if (req.body.price_head_status && req.body.price_head_status != '') {
        priceHeadStatus = req.body.price_head_status;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    let projectManagersOfAM = [{ id: 0, pm_name: 'All' }];
    let retrievalRole = 'AM';
    let requestData = {
        dateSelected: dateSelected,
        lastDate: lastDate,
        secondLastDate: secondLastDate,
        thirdLastDate: thirdLastDate,
        oneMonthOldDate: oneMonthOldDate,
        projectManagerId: projectManagerId,
        accountManagerId: accountManagerId,
        retrievalRole: retrievalRole,
        clientStatus: clientStatus,
        priceHeadStatus: priceHeadStatus
    };
    Delivery.getPriceForDeliverable(requestData, req.session.userData, function (err, priceList) {
        if (err) {
            console.log("Error on retrieving Delivery items....");
            console.log(err);
            next(err);
        } else {
            CustomPrice.getCustomPriceHeadsForMonth(requestData)
            .then(function(priceHeads){
                customPriceHeads = priceHeads;
            })
            .catch(function(data){
                console.log(data);
            });
            //console.log(this.sql);
            isOldDeliverables = 1;
            //let accountManagerId = 0;
            console.log(req.session.userData.v_usertype);
            if (hasAccessUpTo == 'AM') {
                accountManagerId = req.session.userData.id;
            }
            Employee.getAMAll(function (err, accountManagers) {
                if (err) {
                    console.log("Error on retrieving project managers....");
                    console.log(err);
                    next(err);
                } else {
                    // console.log(this.sql);
                    // console.log(accountManagers);
                    let managersToReturn = [];
                    if (req.session.userData.v_usertype.indexOf('SA') != -1 || req.session.userData.v_usertype.indexOf('IM') != -1 || req.session.userData.v_usertype.indexOf('AO') != -1) {
                        managersToReturn = accountManagers;
                    } else if (['AM', 'GM'].indexOf(hasAccessUpTo) != -1) {
                        // console.log(req.session.userData.id);
                        accountManagers.forEach(function (manager) {
                            if (manager.id == req.session.userData.id) {
                                managersToReturn.push(manager);
                            }
                        });
                    }
                    // console.log(managersToReturn);

                    let activityData = {
                        page_url: req.originalUrl,
                        action: 'View',
                        message: 'Viewing a daily deliverable for AM.',
                        created: new Date(),
                        created_by: req.session.userData.id,
                        requestData: req.body,
                        modelUsed: 'Delivery'
                    }
                    ActivityLog.logActivity(activityData, function (err, status) {
                        if (err) {
                            console.log('Error in logging activity');
                            console.log(err);
                            next(err);
                        } else {
                            let pmName = '';
                            let uniquePM = [];
                            if (accountManagerId != 'All' && retrievalRole == 'AM') {
                                priceList.forEach(function (price) {
                                    pmName = price.pm_name.trim();
                                    if (uniquePM.indexOf(pmName) == -1) {
                                        uniquePM.push(pmName);
                                        projectManagersOfAM.push({ id: price.i_empid, pm_name: pmName });
                                    }
                                });
                            }
                            // console.log(managersToReturn);
                            res.render('deliverable/index', {
                                priceList: priceList,
                                dateData: requestData,
                                isOldDeliverables: isOldDeliverables,
                                managers: managersToReturn,
                                isexpiredDate: isexpiredDate,
                                loggedInUserType: req.session.userData.v_usertype,
                                moment: moment,
                                retrievalRole: retrievalRole,
                                hasAccessUpTo: hasAccessUpTo,
                                PMOfSelectedAM: projectManagersOfAM,
                                customPriceHeads : customPriceHeads
                            });
                        }
                    });
                }
            });
        }
    });
});




router.post('/add', function (req, res, next) {
    req.assert('volume', 'Numeric volume is required').notEmpty().isFloat(); //Validate volume lidate planned_monthly_volume
    var errors = req.validationErrors();
    if (!errors) {
        Delivery.addDelivery(req.body, req.session.userData, function (err, result) {
            if (err) {
                console.log("Error on adding deliverables for the date....");
                console.log(err);
                next(err);
            } else {

                User.getUsers({ id: req.body.projectManagerId }, function (err, userData) {
                    if (err) {
                        next(err);
                    } else {
                        let projectManagerDetails = userData[0];
                        let projectManagerName = projectManagerDetails.first_name + ' ' + projectManagerDetails.last_name;
                        console.log(projectManagerDetails);
                        let activityData = {
                            page_url: req.originalUrl,
                            action: 'Add',
                            message: 'Adding daily deliverables for ' + moment(req.body.dateSelected).format("DD-MM-YYYY") + ' for project-manager ' + projectManagerName + '.',
                            created: new Date(),
                            created_by: req.session.userData.id,
                            requestData: req.body,
                            modelUsed: 'Delivery'
                        }
                        ActivityLog.logActivity(activityData, function (err, status) {
                            if (err) {
                                console.log('Error in logging activity');
                                console.log(err);
                                next(err);
                            } else {
                                res.json(result);
                            }
                        });
                    }
                })

            }
        });
    } else {
        res.json({ errors: errors });
    }

});

router.post('/request_change', function (req, res, next) {
    req.assert('volume', 'Numeric volume is required.').notEmpty().isFloat(); //Validate volume    
    var errors = req.validationErrors();
    if (!errors) {
        console.log(req.body);
        DeliveryChangeRequest.addChangeRequest(req.body, req.session.userData, function (err, statusData) {
            if (err) {
                console.log('Error on saving chnage request...');
                console.log(err);
                next(err);
            } else {
                Delivery.getDeliverablesDetails(req.body.deliverable_id, function (err, deliverableData) {
                    if (err) {
                        next(err);
                    } else {
                        let deliverableDetails = deliverableData[0];
                        let activityData = {
                            page_url: req.originalUrl,
                            action: 'Add',
                            message: 'Requesting a change in daily deliverable for client (' + deliverableDetails.v_company + ') for delivery date ' + moment(deliverableDetails.delivery_date).format("DD-MM-YYYY") + '.',
                            created: new Date(),
                            created_by: req.session.userData.id,
                            requestData: req.body,
                            modelUsed: 'DeliveryChangeRequest'
                        }
                        ActivityLog.logActivity(activityData, function (err, status) {
                            if (err) {
                                console.log('Error in logging activity');
                                console.log(err);
                                next(err);
                            } else {
                                res.json(statusData)
                            }
                        });
                    }
                });
            }
        })
    } else {
        res.json({ errors: errors });
    }
});

router.all('/projected_volumes/(:priceMasterId)', (req, res, next) => {
    let priceMasterId = req.params.priceMasterId;

    if (req.query.requested_for) {
        volumeForUserType = req.query.requested_for;
    } else {
        volumeForUserType = req.session.userData.v_usertype;
    }
    //console.log(volumeForUserType);
    MonthlyDelivery.getProjectedVolumes(priceMasterId, volumeForUserType, req.session.userData, function (err, priceItemProjectedVoulems) {
        if (err) {
            console.log('Error in retrieving projected volumes.....');
            console.log(err);
            next(err);
        } else {
            // console.log(this.sql);           
            let monthsHavingVolumes = [], monthVolumes = [], monthVolumeAddedDate = [], monthVolumeAddedBy = [];
            if (priceItemProjectedVoulems[0]['inserted_months']) {
                monthsHavingVolumes = priceItemProjectedVoulems[0]['inserted_months'].split(',');
                monthVolumes = priceItemProjectedVoulems[0]['inserted_volumes'].split(',');
                monthVolumeAddedDate = priceItemProjectedVoulems[0]['added_on'].split(',');
                monthVolumeAddedBy = priceItemProjectedVoulems[0]['added_by'].split(',');
            }
            let activityData = {
                page_url: req.originalUrl,
                created: new Date(),
                created_by: req.session.userData.id,
                requestData: req.body,
                modelUsed: 'MonthlyDelivery'
            }
            if (req.method == 'GET') {

                activityData.action = 'View';
                activityData.message = 'Viewing projected monthly volumes.',
                    ActivityLog.logActivity(activityData, function (err, status) {
                        if (err) {
                            console.log('Error in logging activity');
                            console.log(err);
                            next(err);
                        } else {
                            res.render('deliverable/projected_volumes', {
                                priceItemDetails: priceItemProjectedVoulems[0],
                                monthsHavingVolumes: monthsHavingVolumes,
                                monthVolumes: monthVolumes,
                                monthVolumeAddedDate: monthVolumeAddedDate,
                                monthVolumeAddedBy: monthVolumeAddedBy,
                                moment: moment
                            });
                        }
                    });
            } else {
                delete req.body.start_date; //If set
                delete req.body.end_date; //If set
                //console.log(req.body);
                let indexofMonth;
                Object.keys(req.body).forEach(function (month) {
                    indexofMonth = monthsHavingVolumes.indexOf(month);
                    if (indexofMonth != -1 && req.body[month] == monthVolumes[indexofMonth]) {
                        //console.log("OLDER"+req.body[month]);
                        delete req.body[month];
                    } else {
                        //console.log("NEW" + monthVolumes[indexofMonth]);
                    }
                });
                //console.log(req.body);
                MonthlyDelivery.addMonthlyDelivery(priceMasterId, req.body, volumeForUserType, req.session.userData, monthsHavingVolumes, function (err, statusData) {
                    if (err) {
                        console.log('Error in adding/updating projected volumes.....');
                        console.log(err);
                        next(err);
                    } else {
                        Price.getPriceDetail(priceMasterId, function (err, priceData) {
                            if (err) {
                                next(err);
                            } else {
                                let priceDetails = priceData[0];
                                let userType;
                                if (volumeForUserType == 'AM') {
                                    userType = 'account manager'
                                } else if (volumeForUserType == 'PM') {
                                    userType = 'project manager'
                                } else {
                                    userType = 'admin'
                                }
                                activityData.action = 'Add';
                                activityData.message = 'Adding/Updating projected monthly volumes of ' + userType + ' for client (' + priceDetails.client_name + ').',
                                    ActivityLog.logActivity(activityData, function (err, status) {
                                        if (err) {
                                            console.log('Error in logging activity');
                                            console.log(err);
                                            next(err);
                                        } else {
                                            //console.log(statusData);
                                            res.json(statusData);
                                        }
                                    });
                            }
                        });

                    }
                });
            }
        }
    });

});

router.all('/add_custom_price/(:priceMasterId)/(:projectManagerId)', function (req, res, next) {
    let priceMasterId = req.params.priceMasterId;
    let projectManagerId = req.params.projectManagerId;
    Delivery.getPriceItemDetails(priceMasterId, function (err, priceItemDetails) {
        if (err) {
            console.log('Error in retrieving price intem details.....');
            console.log(err);
            next(err);
        } else {
            if (req.method == 'GET') {
                res.render('deliverable/add_custom_price', {
                    priceItemDetails: priceItemDetails[0],
                    moment: moment
                });
            } else {
                req.assert('invoice_item', 'Price Item is required.').notEmpty(); //Validate price_item    
                req.assert('price_unit', 'Price Unit is required.').notEmpty(); //Validate price_unit  
                req.assert('price_per_unit', 'Numeric Price Per Unit is required.').notEmpty(); //Validate price_per_unit   
                req.assert('volume', 'Numeric Volume is required.').notEmpty().isFloat(); //Validate volume   
                req.assert('requested', 'Requested is required.').notEmpty(); //Validate requested
                var dateArr = req.body.requested.split("-");
                req.body.requested = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];
                var errors = req.validationErrors();
                if (errors) {
                    res.json({ errors: errors });
                } else {
                    CustomPrice.addCustomPrice(req.body, req.session.userData, function (err, status) {
                        if (err) {
                            console.log('Erroe in adding custom price....');
                            console.log(err.message);
                            next(err);
                        } else {
                            Price.getPriceDetail(req.body.price_master_id, function (err, priceHeadData) {
                                if (err) {
                                    next(err);
                                } else {
                                    let priceHeadDetails = priceHeadData[0];
                                    let activityData = {
                                        page_url: req.originalUrl,
                                        action: 'Add',
                                        message: 'Adding a custom price for client (' + priceHeadDetails.client_name + ') for delivery date ' + moment(req.body.start_date).format("DD-MM-YYYY") + '.',
                                        created: new Date(),
                                        created_by: req.session.userData.id,
                                        requestData: req.body,
                                        modelUsed: 'CustomPrice'
                                    }
                                    ActivityLog.logActivity(activityData, function (err, status) {
                                        if (err) {
                                            console.log('Error in logging activity');
                                            console.log(err);
                                            next(err);
                                        } else {
                                            res.json(status);
                                        }
                                    });
                                }
                            })
                        }

                    })
                }
            }
        }
    });
});



router.post('/update_sort_order', function (req, res, next) {
    DeliverableSortOrder.updatePriceHeadSortOrder(req.body, req.session.userData, function (err, status) {
        if (err) {
            next(err);
        } else {
            //console.log(req.body);
            res.send({ staus: "success", message: "Order has been updated." });
        }
    });
});


router.post('/upload_file', FileUploader.single('files[]'), (req, res, next) => {
    console.log(req.body);
    console.log(req.file);
    if (req.file && req.file.error) {
        res.send({ status: 'error' });
    } else {
        req.file.error = false;
        res.send(req.file);
    }
});


router.post('/save_mtd_file', (req, res, next) => {
    console.log(req.body);
    let sheetDataToSave = {};
    req.assert('mtd_original_file', 'Selection of a file is required.').notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
        sheetDataToSave.price_master_id = req.body.price_master_id;
        sheetDataToSave.created_by = req.session.userData.id;
        sheetDataToSave.modified_by = req.session.userData.id;
        sheetDataToSave.created = new Date();
        sheetDataToSave.modified = new Date();
        sheetDataToSave.volume_sheet = req.body.mtd_file;
        sheetDataToSave.sheet_name = req.body.mtd_original_file;
        sheetDataToSave.month = req.body.selected_month;
        sheetDataToSave.year = req.body.selected_year;
        sheetDataToSave.is_custom_price = req.body.is_custom_price;
        //console.log(sheetDataToSave);
        let uploadPath = 'public/uploads/volume_sheets';
        if (!FS.existsSync(uploadPath)) {
            FS.mkdirSync(uploadPath);
        }
        FS.rename('public/tmp/' + req.body.mtd_file, uploadPath + '/' + req.body.mtd_file, function (err) {
            if (err) {
                //next(err);
                res.json(err);
            } else {
                MonthlyDelivery.addMonthlyDeliverySheet(sheetDataToSave, function (err, sheetDetails) {
                    console.log(this.sql);
                    if (err) {
                        next(err);
                    } else {
                        Price.getPriceDetail(req.body.price_master_id, function (err, priceData) {
                            if (err) {
                                next(err);
                            } else {
                                let priceHeadDetail = priceData[0];
                                let activityData = {
                                    page_url: req.originalUrl,
                                    action: 'MTD Sheet Upload',
                                    message: 'Uploading monthly delivery sheet for (' + priceHeadDetail['invoice_item'] + ').',
                                    created: new Date(),
                                    created_by: req.session.userData.id,
                                    requestData: req.body,
                                    modelUsed: 'MonthlyVolumeSheet'
                                }
                                ActivityLog.logActivity(activityData, function (err, status) {
                                    if (err) {
                                        console.log('Error in logging activity');
                                        console.log(err);
                                        next(err);
                                    } else {
                                        res.json(sheetDetails);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.json(errors);
    }
});

router.get('/download_mtd_file/(:fileName)', (req, res, next) => {
    let downloadPath = 'public/uploads/volume_sheets';
    let fileName = req.params['fileName'];
    if (FS.existsSync(downloadPath + '/' + fileName)) {
        res.download(downloadPath + '/' + fileName);
    } else {
        res.redirect('/user/profile/')
    }
});

router.post('/delete_mtd_file', (req, res, next) => {
    let filePath = 'public/uploads/volume_sheets';
    sheetData = req.body;
    MonthlyDelivery.deleteMonthlyDeliverySheet(sheetData, (err, sheets) => {
        if (err) {
            next(err);
        } else {
            // console.log(sheets);
            let sheetDetails = sheets[0];
            let fileName = sheetDetails['volume_sheet'];
            // console.log(fileName);
            if (FS.existsSync(filePath + '/' + fileName)) {
                FS.unlink(filePath + '/' + fileName, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        res.json({ status: '1', message: 'Sheet has been deleted.' });
                    }
                });
            } else {
                res.json({ status: '1', message: 'Sheet has been deleted.' });
            }
        }

    });

});

router.post('/suspend_price_head', (req, res, next) => {
    let priceHeadId = req.body.priceHeadId;
    Price.suspendPriceHead(priceHeadId, (err, priceStatusData) => {
        if (err) {
            next(err);
        } else {
            Price.getPriceDetail(priceHeadId, function (err, priceData) {
                if (err) {
                    next(err);
                } else {
                    let priceHeadDetail = priceData[0];
                    let activityData = {
                        page_url: '/price/suspend',
                        action: 'Suspend',
                        message: 'A price head (' + priceHeadDetail['invoice_item'] + ') has been suspended.',
                        created: new Date(),
                        created_by: req.session.userData.id,
                        requestData: req.body,
                        modelUsed: 'PriceMaster'
                    }
                    ActivityLog.logActivity(activityData, function (err, status) {
                        if (err) {
                            next(err);
                        } else {
                            API.callWMSPriceHeadAPI(priceHeadId, 'updated');
                            if (priceStatusData.affectedRows > 0) {
                                res.json({ status: 'success', message: 'Price Head has been suspended.' });
                            } else {
                                res.json({ status: 'fail', message: 'Price Head has not been suspended.' })
                            }
                        }
                    });
                };
            });
        }
    });

});


module.exports = router;