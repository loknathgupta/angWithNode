var db = require('./db');
var moment = require('moment');

var Delivery = {
    addDelivery: function (requestData, loggedInUserData, callback) {

        //loggedInUserData.i_empid = 2602;
        let dateSelected = requestData.dateSelected;
        let deliveryDataToSave = [];
        let newDeliverable = [];
        var updateQuery = '';
        var modified = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //modified_date;
        var modifiedBy = loggedInUserData.id;
        dailyDeliverableDefalts = [
            dateSelected, //delivery_date
            moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), //created_date
            modified, //modified_date;
            loggedInUserData.id, //created_by
            loggedInUserData.id //modified_by
        ];
        db.query(`select * from daily_deliverable DailyDeliverable where DailyDeliverable.price_master_id in (${requestData.priceMaster}) and DailyDeliverable.delivery_date = '${dateSelected}' `, function (err, result) {
            if (err) {
                throw err;
            } else {
                console.log(result);
                if (requestData.priceMaster instanceof Array) {

                    requestData.priceMaster.forEach(function (value, index) {
                        var rowExists = false;
                        if (result.length > 0) {
                            result.forEach(function (row) {
                                if (row.price_master_id == value) {
                                    updateQuery += " update daily_deliverable set modified = '" + modified + "', modified_by='" + modifiedBy + "', volume='" + requestData.volume[index] + "', description = '" + requestData.description[index] + "' where id ='" + row.id + "'; ";
                                    rowExists = true;
                                }

                            });
                            if (!rowExists) {
                                newDeliverable = dailyDeliverableDefalts.slice();
                                newDeliverable.push(value); //price_master_id
                                newDeliverable.push(requestData.volume[index]); //volume
                                newDeliverable.push(requestData.description[index]); //description
                                deliveryDataToSave.push(newDeliverable);
                            }
                        } else {

                            newDeliverable = dailyDeliverableDefalts.slice();
                            newDeliverable.push(value); //price_master_id
                            newDeliverable.push(requestData.volume[index]); //volume
                            newDeliverable.push(requestData.description[index]); //description
                            deliveryDataToSave.push(newDeliverable);

                        }
                    });
                } else {
                    if (result.length > 0) {
                        var rowExists = false;
                        result.forEach(function (row) {
                            if (row.price_master_id == value) {
                                updateQuery += " update daily_deliverable set modified = '" + modified + "', modified_by='" + modifiedBy + "', volume='" + requestData.volume + "', description = '" + requestData.description + "' where id ='" + row.id + "'; ";
                                rowExists = true;
                            }
                        });
                        if (!rowExists) {
                            newDeliverable = dailyDeliverableDefalts.slice();
                            newDeliverable.push(requestData.priceMaster); //price_master_id
                            newDeliverable.push(requestData.volume); //volume
                            newDeliverable.push(requestData.description); //description
                            deliveryDataToSave.push(newDeliverable);
                        }
                    } else {
                        newDeliverable = dailyDeliverableDefalts.slice();
                        newDeliverable.push(requestData.priceMaster); //price_master_id
                        newDeliverable.push(requestData.volume); //volume
                        newDeliverable.push(requestData.description); //description
                        deliveryDataToSave.push(newDeliverable);
                    }
                }
            }
            console.log(updateQuery);
            db.query(`INSERT INTO daily_deliverable 
        (delivery_date , created , modified , created_by , modified_by, price_master_id, volume, description) VALUES ?`,
                [deliveryDataToSave],
                function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        if (updateQuery != '') {
                            return db.query(updateQuery, callback);
                        } else {
                            callback(err,result);
                        }
                    }
                }
            );
        });
    },
    getPriceForDeliverable: function (requestData, loggedInUserData, callback) {
        let dateSelected = requestData.dateSelected;
        let lastDate = requestData.lastDate;
        let secondLastDate = requestData.secondLastDate;
        let thirdLastDate = requestData.thirdLastDate;

        let retrievalRole = requestData.retrievalRole;
        let priceMasterRetrievalCondition = customPriceMasterRetrievalCondition = '1';
        let userId = loggedInUserData.id;
        //console.log(retrievalRole);
        if (retrievalRole == 'PM') {
            priceMasterRetrievalCondition = priceMasterRetrievalCondition + ` AND PriceMaster.i_empid = '${requestData.projectManagerId}'`;
            customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND CustomPriceMaster.i_empid = '${requestData.projectManagerId}'`;
        } else if (retrievalRole == 'AM') {
            if (requestData.accountManagerId != 'All') {
                priceMasterRetrievalCondition = priceMasterRetrievalCondition + ` AND PriceMaster.account_manager_id = '${requestData.accountManagerId}'`;
                customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND CustomPriceMaster.account_manager_id = '${requestData.accountManagerId}'`;
            }
        }

        if (requestData.priceHeadStatus != 0) {
            priceMasterRetrievalCondition = priceMasterRetrievalCondition + ` AND PriceMaster.status = '${requestData.priceHeadStatus}'`;
            customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND CustomPriceMaster.status = '${requestData.priceHeadStatus}'`;
        }

       if (requestData.clientStatus == 2) {
            priceMasterRetrievalCondition = priceMasterRetrievalCondition + ` AND PriceMaster.client_status = '${requestData.clientStatus}'`;
            if (requestData.clientStatus != 1) {
                customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND 0`;
            }
        }
        let selectedDate = new Date(dateSelected);
        let y = selectedDate.getFullYear();
        let m = selectedDate.getMonth();

        let currentMonth = selectedDate.getMonth() + 1;
        let currentYear = y;

        let firstDayOfSelectedMonth = moment(new Date(y, m, 1)).format('YYYY-MM-DD');
        let lastDayOfSelectedMonth = moment(new Date(y, m + 1, 0)).format('YYYY-MM-DD');

        y = selectedDate.getFullYear();
        m = selectedDate.getMonth() - 1;
        let firstDayOfLastMonth = moment(new Date(y, m, 1)).format('YYYY-MM-DD');
        let lastDayOfLastMonth = moment(new Date(y, m + 1, 0)).format('YYYY-MM-DD');
        let query = `SELECT 
        PriceMaster.id as price_master_id,
        PriceMaster.i_empid,
        PriceMaster.invoice_item,
        PriceMaster.status as status,
        PriceMaster.price_unit,
        PriceMaster.client_status as client_status,
        (SELECT ROUND(SUM(volume), 2) FROM daily_deliverable WHERE daily_deliverable.price_master_id = PriceMaster.id AND (delivery_date ='${lastDate}') GROUP BY daily_deliverable.price_master_id) as last_date_volume,
        (SELECT ROUND(SUM(volume), 2) FROM daily_deliverable WHERE daily_deliverable.price_master_id = PriceMaster.id AND (delivery_date ='${secondLastDate}') GROUP BY daily_deliverable.price_master_id) as second_last_date_volume,
        (SELECT ROUND(SUM(volume), 2) FROM daily_deliverable WHERE daily_deliverable.price_master_id = PriceMaster.id AND (delivery_date ='${thirdLastDate}') GROUP BY daily_deliverable.price_master_id) as third_last_date_volume,
        (SELECT ROUND(SUM(volume), 2) FROM daily_deliverable WHERE daily_deliverable.price_master_id = PriceMaster.id AND (delivery_date  BETWEEN '${firstDayOfSelectedMonth}' AND '${dateSelected}') GROUP BY daily_deliverable.price_master_id) as mtd_volume,
        (SELECT ROUND(SUM(volume), 2) FROM daily_deliverable WHERE daily_deliverable.price_master_id = PriceMaster.id AND (delivery_date  BETWEEN '${firstDayOfLastMonth}' AND '${lastDayOfLastMonth}') GROUP BY daily_deliverable.price_master_id) as last_month_volume,
        (select concat(	first_name, \' \',last_name) from user User where PriceMaster.i_empid = User.id) as pm_name,  
        (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name,
        (select CONCAT(MonthlyVolume.volume,'@@@',User.first_name, '@@@', User.last_name, '@@@', MonthlyVolume.modified) as details from monthly_volume MonthlyVolume JOIN user User on (User.id  = MonthlyVolume.modified_by) WHERE MonthlyVolume.month= '${currentMonth}' AND MonthlyVolume.year='${currentYear}' AND MonthlyVolume.user_type = 'PM' AND MonthlyVolume.price_master_id = PriceMaster.id LIMIT 1) as details_planned_monthly_volume_by_PM,
        (select CONCAT(MonthlyVolume.volume,'@@@',User.first_name, '@@@', User.last_name, '@@@', MonthlyVolume.modified) as details from monthly_volume MonthlyVolume JOIN user User on (User.id  = MonthlyVolume.modified_by) WHERE MonthlyVolume.month= '${currentMonth}' AND MonthlyVolume.year='${currentYear}' AND MonthlyVolume.user_type = 'AM' AND MonthlyVolume.price_master_id = PriceMaster.id LIMIT 1) as details_planned_monthly_volume_by_AM,
        (SELECT volume_sheet FROM monthly_volume_sheet WHERE price_master_id = PriceMaster.id AND month = '${currentMonth}' AND year='${currentYear}' AND is_custom_price = 0 LIMIT 1 ) as monthly_volume_sheet,
        DailyDeliverable.id as deliverable_id,
        DailyDeliverable.volume,
        DailyDeliverable.description,
        (SELECT CONCAT(volume,'@@@',description) as detail FROM daily_deliverable_change_req DeliveryChangeRequest WHERE DeliveryChangeRequest.status='P' AND DeliveryChangeRequest.daily_deverable_id = DailyDeliverable.id ORDER BY id DESC LIMIT 1 ) as panding_change_request,
        (SELECT GROUP_CONCAT(volume) as last_volumes FROM daily_deliverable_audit DeliveryAudit WHERE audit_insert_type = 'VolUpdate' AND DeliveryAudit.id = DailyDeliverable.id ORDER BY audit_timestamp DESC) as approve_requested_volumes,
        0 as is_custom,
        if(DeliverySortOrder.sort_order, DeliverySortOrder.sort_order, 0) as sort_order
        FROM price_master PriceMaster 
        LEFT JOIN daily_deliverable DailyDeliverable ON(DailyDeliverable.price_master_id = PriceMaster.id AND DailyDeliverable.delivery_date = '${dateSelected}')
        LEFT JOIN deliverables_sort_order DeliverySortOrder ON(DeliverySortOrder.price_master_id = PriceMaster.id AND DeliverySortOrder.user_id = '${userId}' AND DeliverySortOrder.price_type = 'S')
        WHERE ('${dateSelected}' BETWEEN PriceMaster.start_date AND PriceMaster.end_date)
        AND ${priceMasterRetrievalCondition}
        UNION
        SELECT CustomPriceMaster.id as price_master_id,
        CustomPriceMaster.i_empid, 
        invoice_item,
        null as status,
        price_unit,
        1 as client_status,
        null as last_date_volume,
        null as second_last_date_volume,
        null as third_last_date_volume,
        volume as mtd_volume,
        null last_month_volume,
        (select concat(	first_name, \' \',last_name) from user User where CustomPriceMaster.created_by = User.id) as pm_name,  
        (select v_company from tbl_client Client where CustomPriceMaster.i_clientid = Client.i_clientid) as client_name,
        null as details_planned_monthly_volume_by_PM,
        null as details_planned_monthly_volume_by_AM,
        (SELECT volume_sheet FROM monthly_volume_sheet WHERE price_master_id = CustomPriceMaster.id AND month = '${currentMonth}' AND year='${currentYear}' AND is_custom_price = 1 LIMIT 1 ) as monthly_volume_sheet,
        null as deliverable_id,
        volume,
        description,
        null as panding_change_request,
        null as approve_requested_volumes,
        1 as is_custom,
        if(DeliverySortOrder.sort_order, DeliverySortOrder.sort_order, 0) as sort_order
        FROM custom_price_master CustomPriceMaster 
        LEFT JOIN deliverables_sort_order DeliverySortOrder ON(DeliverySortOrder.price_master_id = CustomPriceMaster.id AND DeliverySortOrder.user_id = '${userId}' AND DeliverySortOrder.price_type = 'C')
        WHERE ('${dateSelected}' BETWEEN CustomPriceMaster.start_date AND CustomPriceMaster.end_date)
        AND ${customPriceMasterRetrievalCondition}
        AND status != 'R'
        ORDER BY sort_order ASC`;
        // console.log(query);
        return db.query(query, callback);
    },
    checkDeliverableForDate: function (dateSelected, projectManagerId, callback) {
        let query = `SELECT COUNT(DailyDeliverable.id) as addedDeliverables 
        FROM daily_deliverable DailyDeliverable
        JOIN price_master PriceMaster ON(PriceMaster.id = DailyDeliverable.price_master_id)
        WHERE DailyDeliverable.delivery_date = '${dateSelected}'
        AND price_master_id IN(SELECT id FROM price_master WHERE i_empid = '${projectManagerId}' and status!='S' and client_status!='2' and '${dateSelected}' between start_date and end_date)`;
        return db.query(query, callback);
    },
    countPriceHeadForDelivery: function (dateSelected, projectManagerId, callback) {
        let query = `SELECT COUNT(PriceMaster.id) as totalPriceHead 
        FROM  price_master PriceMaster where
        i_empid = '${projectManagerId}' and client_status!=2 and '${dateSelected}' between start_date and end_date and status!='S' `;
        return db.query(query, callback);
    },
    getRequestAll: function (callback) {

        let query = `SELECT 
        PriceMaster.id as price_master_id,
        PriceMaster.invoice_item,
        DailyDeliverable.id as deliverable_id,
        DailyDeliverable.volume as old_volume,
        DailyDeliverable.description as old_description,
        DeliverableReq.volume,
        DeliverableReq.description,
        DeliverableReq.created
        from  daily_deliverable_change_req DeliverableReq
        inner join daily_deliverable DailyDeliverable on DeliverableReq.daily_deverable_id = DailyDeliverable.id
        inner join price_master PriceMaster on DailyDeliverable.price_master_id = PriceMaster.id
         
        ORDER BY DeliverableReq.created desc `;
        return db.query(query, [changeRequestData], callback);
    },
    getPriceItemDetails: function (priceItem, callback) {
        let query = `SELECT 
        PriceMaster.id as price_master_id,
        PriceMaster.invoice_item,
        PriceMaster.price_unit,
        PriceMaster.currency,
        PriceMaster.ao_id,
        PriceMaster.i_empid as i_empid,
        PriceMaster.account_manager_id as account_manager_id,
        Client.i_clientid as client_id,
        Client.v_company as client_name
        FROM price_master PriceMaster
        JOIN tbl_client Client ON(Client.i_clientid = PriceMaster.i_clientid)
        where PriceMaster.id = '${priceItem}'
        `;
        return db.query(query, callback);
    },
    getDeliverablesDetails: function (deliverableId, callback) {
        let query = `SELECT Client.v_company, DailyDeliverable.delivery_date
        FROM daily_deliverable DailyDeliverable
        JOIN price_master PriceMaster ON (DailyDeliverable.price_master_id = PriceMaster.id)
        JOIN tbl_client Client ON (PriceMaster.i_clientid = Client.i_clientid)
        WHERE DailyDeliverable.id = ${deliverableId}        
        `;
        return db.query(query, callback);
    },
    oldInputUpdate : function(newPriceMasterId, postData, callback){
        let query = `UPDATE 
        daily_deliverable 
        SET price_master_id = '${newPriceMasterId}' 
        WHERE price_master_id = '${postData.parent_id}'
        AND delivery_date >= '${postData.start_date}'`;
        db.query(query, callback);
    },



    insertDefaultForSuspendedHeads: function(callback){
        let query = `SELECT 
        id, 
        i_empid, 
        start_date, 
        end_date 
        FROM 
        price_master 
        WHERE 
        status = 'S'
        OR (id IN (SELECT DISTINCT (id) FROM price_master_audit WHERE status = 'S'))
        `
        return db.query(query, function(err, priceHeads){
            if(err){
                callback;
            }else{                
                getAllPMWithDelieryDates(priceHeads)
                .then(function(pmWithDeliveryDates){   
                    getPriceHeadsWithDates(priceHeads)
                    .then(function(priceHeadWithDeliveryDates){
                        //console.log(priceHeadWithDeliveryDates);
                        priceHeadTs = [];
                        priceHeadTs[0] = priceHeads[1];
                        getDelieryDateToInsert(priceHeads, pmWithDeliveryDates, priceHeadWithDeliveryDates)
                        .then(function(missedDeliveryDates){
                            // console.log("DATA TO SAVE FOR ");
                            console.log(missedDeliveryDates.length);
                            if(missedDeliveryDates.length > 0){
                                return db.query(`INSERT INTO daily_deliverable 
                                (volume, description,  created , modified , created_by , modified_by, price_master_id, delivery_date) VALUES ?`,
                                    [missedDeliveryDates],callback);  
                            }
                        })
                    })                 
                    //console.log(pmWithDeliveryDates);
                })
                
                callback;
            }
        });
    }
};
function getAllPMWithDelieryDates(priceHeads){
    return new Promise(function(resolve, reject){
        let pmDeliveryDates = {};
        let counter = 0;
        let uniquePM = 0;
        priceHeads.forEach(function(priceHead){                        
            if(!pmDeliveryDates[priceHead['i_empid']]){
                uniquePM++;
                pmDeliveryDates[priceHead['i_empid']] = [];
            }
        });
        for(pm in pmDeliveryDates){
            getDatesWithValueForPM(pm)
            .then(function(datesWithDelivery){                            
                counter++;
                pmDeliveryDates[datesWithDelivery[0]] = datesWithDelivery[1]; 
                if(counter == uniquePM){
                    resolve(pmDeliveryDates);
                }
            });
        }
    });
}
function getDatesWithValueForPM(pmId){
    return new Promise(function(resolve, reject){
        let query = `SELECT DISTINCT DATE(delivery_date) as date_with_delivery FROM daily_deliverable 
        WHERE price_master_id IN (SELECT id FROM price_master WHERE i_empid = '${pmId}') ORDER BY delivery_date`;
        db.query(query, function(err, datesHavingDeliverabels){
            if(err){
                reject(err);
            }else{
                let datesWithDeliveryForPM = [];
                datesHavingDeliverabels.forEach(function(date){
                    datesWithDeliveryForPM.push(date['date_with_delivery'].toString());
                });
                resolve([pmId, datesWithDeliveryForPM]);
            }
        })
    });
}

function getPriceHeadsWithDates(priceHeads){
    let priceHeadsWithDeliveryDates = {};
    let totalPricesHeads = priceHeads.length;
    let counter = 0;
    return new Promise(function(resolve, reject){
        priceHeads.forEach(function(priceHead){
            getDates(priceHead)
            .then(function(deliveredDates){
                counter++;
                priceHeadsWithDeliveryDates[deliveredDates[0]] = deliveredDates[1];
                if(counter == totalPricesHeads){
                    resolve(priceHeadsWithDeliveryDates);
                }
            });
        });
    });
}

function getDates(priceHead){
    return new Promise(function(resolve, reject){
        let query = `SELECT DISTINCT DATE(delivery_date) as delivered_date FROM daily_deliverable 
        WHERE price_master_id  = '${priceHead['id']}' ORDER BY delivery_date`;
        let deliveredDates = [];
        db.query(query, function(err, datesHavingDeliverabels){
            if(err){
                reject(err);
            }else{
                datesHavingDeliverabels.forEach(function(dDate){
                    deliveredDates.push(dDate['delivered_date'].toString());
                })
                resolve([priceHead['id'], deliveredDates]);
            }
        })
    });
}


function getDelieryDateToInsert(priceHeads, pmWithDeliveryDates, priceHeadWithDeliveryDates){    
    return new Promise(function(resolve, reject){
        let delieryDateToInsert = [];
        dailyDeliverableDefalts = [
            0,  //volume
            '', //description
            new Date(), //created_date
            new Date(), //modified_date
            1, //created_by
            1 //modified_by
        ];
        priceHeads.forEach(function(priceHead){
            let priceHeadPMDeliveredDates = pmWithDeliveryDates[priceHead['i_empid']];
            let priceHeadDeliveredDates = priceHeadWithDeliveryDates[priceHead['id']];
            getMisssingDateForPriceHead(priceHead['start_date'], priceHead['end_date'], priceHeadPMDeliveredDates, priceHeadDeliveredDates)
            .then(function(missingDates){
                // console.log('MISSIONG DATES FOR '+priceHead['id']);
                // console.log(missingDates);
                missingDates.forEach(function(dateMissed){
                    dateMissed = new Date(dateMissed);
                    newDeliverable = dailyDeliverableDefalts.slice();
                    newDeliverable.push(priceHead['id']); //price_head_id
                    newDeliverable.push(dateMissed); //delivery_date
                    delieryDateToInsert.push(newDeliverable);
                });                
                resolve(delieryDateToInsert);
            });
        })
    });
}


function getMisssingDateForPriceHead(startDate, endDate, pmDeliveredDates, priceHeadDeliveredDates){
    return new Promise(function(resolve, reject){
        let priceHeadStartDate = new Date(startDate);
        let priceHeadEndDate = new Date(endDate);
        let currentDate = new Date();
        let currentDateTimeStamp = currentDate.getTime();
        let startDateTimeStamp = priceHeadStartDate.getTime();
        let endDateTimeStamp = priceHeadEndDate.getTime();
        let dateDiff = 0;
        let missingDates = [];
        if(endDateTimeStamp > currentDateTimeStamp){
            endDateTimeStamp = currentDateTimeStamp;
            priceHeadEndDate = currentDate;
        }
        pmDeliveredDates.forEach(function(deliveredDate){
            let dateDelivery = new Date(deliveredDate);
            //console.log(dateDelivery);
            if(priceHeadDeliveredDates.indexOf(deliveredDate) === -1 && startDate.getTime() <= dateDelivery.getTime() && endDate.getTime() >= dateDelivery.getTime()){
                //console.log('MISSING DATE IS '+deliveredDate);
                missingDates.push(deliveredDate);
            }
        });
        resolve(missingDates);
    });
}


module.exports = Delivery;