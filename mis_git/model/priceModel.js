var db = require('./db');
var User = require('./userModel');
var moment = require('moment');
var config = require('../config');
var res= [];
function addDefaultsForDeliverables(err, priceStatusData, priceData, callback){
    // console.log(priceStatusData);
    db.query(`SELECT DISTINCT delivery_date as date_with_delivery FROM daily_deliverable 
                WHERE (delivery_date BETWEEN '${priceData.start_date}' AND CURDATE()) 
                AND price_master_id IN (SELECT id FROM price_master WHERE i_empid = '${priceData.i_empid}')`, 
                function(err, datesHavingDeliverabels){
                    if(err){
                        callback(err, priceStatusData);
                    }else{
                        let datesWithDeliverable = [];
                        if(datesHavingDeliverabels){
                            datesHavingDeliverabels.forEach(function(dateWithDelivery){
                                datesWithDeliverable.push(moment(dateWithDelivery['date_with_delivery']).format('YYYY-MM-DD'));
                            });
                        }
                        // console.log(datesWithDeliverable);
                        let currentDate = new Date();
                        let currentDateTimeStamp = currentDate.getTime();
                        let startDate = new Date(priceData.start_date);
                        let startDateTimeStamp = startDate.getTime();
                        let priceMasterId = priceStatusData.insertId;     
                        if(currentDateTimeStamp > startDateTimeStamp ){
                            let dateDiff = Math.floor((currentDateTimeStamp - startDateTimeStamp) / (1000 * 3600 * 24));
                            let deliveryDataToSave = [];
                            let day;
                            dailyDeliverableDefalts = [
                                priceMasterId, //price_master_id
                                0,  //volume
                                '', //description
                                moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), //created_date
                                moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), //modified_date
                                priceData.created_by, //created_by
                                priceData.created_by //modified_by
                            ];
                            let deliveryDate, newDeliverable;
                            // console.log(startDate);  
                            for(day=0; day <= dateDiff; day++){                            
                                newDeliverable = dailyDeliverableDefalts.slice();
                                deliveryDate = moment(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+day)).format('YYYY-MM-DD');
                                // console.log(deliveryDate);
                                if(datesWithDeliverable.indexOf(deliveryDate) != -1){
                                    newDeliverable.push(deliveryDate); //delivery_date
                                    deliveryDataToSave.push(newDeliverable);
                                }
                            }
                            if(deliveryDataToSave.length > 0){
                                return db.query(`INSERT INTO daily_deliverable 
                                (price_master_id, volume, description,  created , modified , created_by , modified_by, delivery_date) VALUES ?`,
                                    [deliveryDataToSave],
                                    callback(err, priceStatusData)
                                );  
                            }else{
                                console.log('No any entry made for any past date for the selected project manager.');
                                callback(err, priceStatusData);
                            }
                            
                        }else{
                            console.log('Date is either current or future one');
                            callback(err, priceStatusData);
                        }
                    }
                });
}
var Price = {
    

    getUniqPrice : function(conditions, callback){
        
            return db.query(`SELECT * FROM price_master WHERE invoice_item = '${conditions.invoice_item}' and 	i_clientid = '${conditions.i_clientid}' and start_date =  '${conditions.start_date}' limit 1`,[conditions], callback)
        
    },
    getpriceIdByClient: function(i_clientid,callback){
           return db.query(`Select id from price_master where i_clientid ='${i_clientid}'`,callback);
    },
    getPriceDetail : function(id, callback){
        
        return db.query(`SELECT PriceMaster.*, 
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.i_empid = Employee.id) as pm_name,
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.account_manager_id = Employee.id) as am_name,
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.ao_id = Employee.id) as ao_name,
        (select v_company from tbl_client where PriceMaster.i_clientid = tbl_client.i_clientid) as client_name
        FROM price_master as PriceMaster WHERE id = '${id}' `, callback)
    
},
    getPriceAll : function(callback){
             return db.query("(SELECT DISTINCT "+
             "PriceMaster.id, "+
             " PriceMaster.parent_id, "+
             " PriceMaster.i_clientid, "+
             " PriceMaster.invoice_item, "+
             " PriceMaster.start_date, "+
             " PriceMaster.end_date, "+
             " PriceMaster.price_per_unit, "+
             " PriceMaster.currency, "+
             " PriceMaster.description, "+
             " PriceMaster.price_unit, "+
             " PriceMaster.created,"+
             " PriceMaster.modified,"+
             " PriceMaster.created_by,"+
             " PriceMaster.modified_by,"+
             " PriceMaster.effort_per_unit,"+
             " PriceMaster.invoice_to,"+
             " PriceMaster.invoice_cc,"+
             " PriceMaster.client_status,"+
             " PriceMaster.price_type,"+
             " PriceMaster.approval_status,"+
             "MonthlyVolume.volume as monthly_volume, " +
             "concat(BillingCycle.value,'',if(PriceMaster.billing_cycle=6,concat(' (',billing_day,') '),'')) as billing_cycle, "+
             "CreditPeriod.value as credit_period, "+
             "'No' as custom, "+
             "IF(status= 'A','Active', IF(status= 'S','Suspended','Inactive'))as status, "+
             "(select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.ao_id = Employee.id) as ao_name, "+
             "(select employee_code from user Employee where PriceMaster.ao_id = Employee.id) as ao_emp_code, "+
             "(select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.account_manager_id = Employee.id) as am_name, "+
             "(select employee_code from user Employee where PriceMaster.account_manager_id = Employee.id) as am_emp_code, "+
             "(select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.i_empid = Employee.id) as pm_name, "+
             "(select employee_code from user Employee where PriceMaster.i_empid = Employee.id) as pm_emp_code, "+
             "(select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name, "+   
             
             "(select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.created_by = Employee.id) as created_user, "+ 
             "(select count(id) from price_master pm where pm.parent_id = PriceMaster.id) as child_exists " +        
             "FROM price_master as PriceMaster "+
             "left join billing_cycle as BillingCycle on BillingCycle.id = PriceMaster.billing_cycle "+
             "left join credit_period as CreditPeriod on CreditPeriod.id = PriceMaster.credit_period "+
             "left join monthly_volume as MonthlyVolume on MonthlyVolume.price_master_id = PriceMaster.id and MonthlyVolume.month = month(now()) and MonthlyVolume.user_type = 'SA' "+
             //"where PriceMaster.status = 'A' "+
             "ORDER BY PriceMaster.id desc) Union (SELECT DISTINCT "+
             " CustomPriceMaster.id, "+
             "0 as parent_id, "+
             " CustomPriceMaster.i_clientid, "+
             " CustomPriceMaster.invoice_item, "+
             " CustomPriceMaster.start_date, "+
             " CustomPriceMaster.end_date, "+
             " CustomPriceMaster.price_per_unit, "+
             " CustomPriceMaster.currency, "+
             " CustomPriceMaster.description, "+
             " CustomPriceMaster.price_unit, "+
             " CustomPriceMaster.created,"+
             " CustomPriceMaster.modified,"+
             " CustomPriceMaster.created_by,"+
             " CustomPriceMaster.modified_by,"+
             " 0 as effort_per_unit,"+
             " '' as invoice_to,"+
             " '' as invoice_cc,"+
             "1 as client_status, "+
             " 'F' as price_type,"+
             "'N' as approval_status,"+
             " 0 as monthly_volume, " +
             "'' as billing_cycle, "+
             "'' as credit_period, "+
             "'Yes' as custom, "+
             "if(CustomPriceMaster.status= 'A','Approved',if(CustomPriceMaster.status='P','Pending','Rejected'))as status, "+
             "(select concat(	first_name, ' ',last_name) from user Employee where CustomPriceMaster.ao_id = Employee.id) as ao_name, "+
             "(select employee_code from user Employee where CustomPriceMaster.ao_id = Employee.id) as ao_emp_code, "+
             "(select concat(	first_name, ' ',last_name) from user Employee where CustomPriceMaster.account_manager_id = Employee.id) as am_name, "+
             "(select employee_code from user Employee where CustomPriceMaster.account_manager_id = Employee.id) as am_emp_code, "+
             "(select concat(	first_name, ' ',last_name) from user Employee where CustomPriceMaster.i_empid = Employee.id) as pm_name, "+
             "(select employee_code from user Employee where CustomPriceMaster.i_empid = Employee.id) as pm_emp_code, "+
             "(select v_company from tbl_client Client where CustomPriceMaster.i_clientid = Client.i_clientid) as client_name, "+   
             "(select concat(first_name, ' ',last_name) from user Employee where CustomPriceMaster.created_by = Employee.id) as created_user, "+ 
             "0 as child_exists " +        
             "FROM custom_price_master as CustomPriceMaster "+
             
            
             //"where PriceMaster.status = 'A' "+
             "ORDER BY CustomPriceMaster.id desc) ", callback);       
    },
    getInvoiceDataAll : function(condition,callback){
        let query = `SELECT 
        PriceMaster.invoice_item,
        PriceMaster.id, 
        PriceMaster.i_clientid,
        PriceMaster.price_per_unit, 
        PriceMaster.price_unit, 
        PriceMaster.currency, 
        PriceMaster.price_type,
        0 as is_custom, 
        (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.last_month_from}' and  '${condition.last_month_to}'  group by DailyDeliverable.price_master_id  )as last_month_volume,   
        (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.from}' and  '${condition.to}'  group by DailyDeliverable.price_master_id  )as volume,  
        
        (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date = '${condition.thirdLastDate}'   group by DailyDeliverable.price_master_id  )as third_last_volume,  

        (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date = '${condition.secondLastDate}'   group by DailyDeliverable.price_master_id  )as second_last_volume,   

        (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date = '${condition.lastDate}'   group by DailyDeliverable.price_master_id  )as last_volume,   
    
        (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name,  
        (select concat(	first_name, ' ',last_name) from user User where PriceMaster.i_empid = User.id) as pm_name,     
        (select concat(	first_name, ' ',last_name) from user User where PriceMaster.account_manager_id = User.id) as am_name,     
        (select concat(	first_name, ' ',last_name) from user User where PriceMaster.ao_id = User.id) as ao_name          
        FROM price_master as PriceMaster
        WHERE  PriceMaster.client_status !='2' 
        AND PriceMaster.start_date <=  '${condition.to}' 
        AND PriceMaster.end_date >=  '${condition.from}'`;

        let customPriceQuery = `SELECT 
        CustomPriceMaster.invoice_item,
        CustomPriceMaster.id, 
        CustomPriceMaster.i_clientid,
        CustomPriceMaster.price_per_unit, 
        CustomPriceMaster.price_unit, 
        CustomPriceMaster.currency, 
        'F' as price_type,
        1 as is_custom, 
        null as last_month_volume,   
        CustomPriceMaster.volume as volume, 
        null as third_last_volume,
        null as second_last_volume, 
        null as last_volume,   
    
        (select v_company from tbl_client Client where CustomPriceMaster.i_clientid = Client.i_clientid) as client_name,  
        (select concat(	first_name, ' ',last_name) from user User where PriceMaster.i_empid = User.id) as pm_name,     
        (select concat(	first_name, ' ',last_name) from user User where PriceMaster.account_manager_id = User.id) as am_name,     
        (select concat(	first_name, ' ',last_name) from user User where PriceMaster.ao_id = User.id) as ao_name          
        FROM custom_price_master as CustomPriceMaster
        JOIN price_master PriceMaster ON(CustomPriceMaster.price_master_id = PriceMaster.id)
        Where  CustomPriceMaster.status='A' 
        AND PriceMaster.client_status !='2' 
        AND CustomPriceMaster.start_date <=  '${condition.to}' 
        And CustomPriceMaster.end_date >=  '${condition.from}'`;

        query = query + ' UNION ' +customPriceQuery;

        return db.query(query, callback);       
},
getSlabPriceAll : function(ids,callback){
    if(ids.length==0){
        ids=[0];
    }
    return db.query("SELECT "+
    "SlabPrice.id, "+
    "SlabPrice.price_master_id, "+
    "SlabPrice.volume_from, "+
    "SlabPrice.volume_to, "+
    "SlabPrice.price, "+ 
    "PriceMaster.currency "+         
    "FROM slab_price as SlabPrice "+
    " inner join price_master as PriceMaster on PriceMaster.id = SlabPrice.price_master_id"+
   
    " where  "+
    "PriceMaster.id in ("+ids+") "+
    "ORDER BY SlabPrice.id ", callback);       
},
    savePrice : function(priceData, callback){
        // console.log(priceData);
        var priceSlabsToSave = [];
        if(priceData.price_type == 'S'){
            priceData.price_per_unit = 0;
            var slabData = [
                new Date(), //created
                new Date(), //modified
                new Date(), //modified
            ];
            for(var key in priceData.vprice){
                if(parseInt(priceData.vprice[key])>0){
                    let slabFromVolume = priceData.vfrom[key];
                    let slabToVolume = (priceData.vto[key]?priceData.vto[key]:null);
                    let slabPrice = priceData.vprice[key];
                    if(slabFromVolume != ''){
                        priceSlabsToSave.push([slabFromVolume, slabToVolume, slabPrice, priceData.created, priceData.modified, priceData.created_by, priceData.modified_by]);
                    }
                }
            }
        }
        {
            delete priceData.vfrom;
            delete priceData.vto;
            delete priceData.vprice;

        }
        // console.log(priceData);
        db.query('INSERT INTO price_master SET ?', priceData, function(err, statusPriceData){
            if(err){
                callback(err, statusPriceData);
            }else{
                
                if(priceSlabsToSave.length > 0){
                    var dataToSave = [];
                    priceSlabsToSave.forEach(function(priceSlab){
                        priceSlab.push(statusPriceData.insertId);
                        dataToSave.push(priceSlab);
                    });
                    //console.log(dataToSave);
                    db.query(`INSERT INTO slab_price (volume_from, volume_to , price , created , modified, created_by , modified_by, price_master_id) VALUES ?`, [dataToSave], function(err, status){
                        if(err){
                            console.log(err);
                            callback(err, statusPriceData);
                        }else{
                            if(!priceData.parent_id){
                                addDefaultsForDeliverables(err, statusPriceData, priceData, callback);
                            }else{
                                callback(err, statusPriceData); 
                            }
                        }
                    })
                }else{
                    if(!priceData.parent_id){
                        addDefaultsForDeliverables(err, statusPriceData, priceData, callback);
                    }else{
                        callback(err, statusPriceData); 
                    }
                }
            }
        })
    },
    updatePrice : function(fieldsWithValues, id,i_clientid,client_status_old, callback){
        //var ids = conditions.toString();
        return db.query(`UPDATE price_master SET ? WHERE id = '${id}'`, [fieldsWithValues ], function(err,result){
            if(err){
                throw err;
            }else{
                if(fieldsWithValues.client_status==2 || (client_status_old ==2 && fieldsWithValues.client_status==1) ){
                    Price.updateMulTiplePrice({"client_status":fieldsWithValues.client_status},i_clientid,callback);
                }else{
                    callback(result);
                }
            }
        });
    },
    updateMulTiplePrice : function(fieldsWithValues, client_id, callback){
        //var ids = conditions.toString();
        return db.query(`UPDATE price_master SET ? WHERE 	i_clientid = '${client_id}'`, [fieldsWithValues ], callback)
    },
    getMonthlyVolume : function(conditions, callback){
        console.log(conditions);
        return db.query(`select volume from monthly_volume WHERE month= ? and user_type = ? `, [conditions.month,conditions.user_type], callback)
    },
    saveMonthlyVolume: function(volumeData, callback){

        return db.query('INSERT INTO monthly_volume SET ?', volumeData, callback)
    },
    getPriceUnitAll: function(conditions, callback){
        return db.query(`select distinct price_unit from price_master where price_unit like '${conditions.trim()}%' order by price_unit`,callback);
    },
    savePriceLog: function(logData, client_id, callback){
        var saveData = new Array();
        logData.modified = new Date();
        logData.created = new Date();
        //console.log(logData);
        var i=0
        if(logData.new_am!=logData.old_am){
           saveData[i++] = [logData.price_master_id, 'Changed Account Manager from ['+logData.old_am+'] to ['+logData.new_am+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
        }
        if(logData.new_ao!=logData.old_ao){
            saveData[i++] = [logData.price_master_id, 'Changed Account Owner from ['+logData.old_ao+'] to ['+logData.new_ao+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
        if(logData.new_pm!=logData.old_pm){
            saveData[i++] = [logData.price_master_id,'Changed Project manager from ['+logData.old_pm+'] to ['+logData.new_pm+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         if(logData.price_per_unit_new!=logData.price_per_unit_old && logData.price_type_old == 'F' && logData.price_type == 'F'){
            saveData[i++] = [logData.price_master_id,'Changed Price from ['+logData.price_per_unit_old+'] to ['+logData.price_per_unit_new+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         if(logData.end_date_new!= moment(new Date(logData.end_date_old)).format('YYYY-MM-DD')){
            saveData[i++] = [logData.price_master_id,'Changed End Date from ['+moment(logData.end_date_old).format('DD-MM-YYYY')+'] to ['+moment(logData.end_date_new).format('DD-MM-YYYY')+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         if(logData.effort_new!=logData.effort_old ){
            saveData[i++] = [logData.price_master_id,'Changed Effort Per Unit from ['+logData.effort_old+'] to ['+logData.effort_new+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         if(logData.currency_old!=logData.currency_new ){
            saveData[i++] = [logData.price_master_id,'Changed Price from ['+logData.currency_old+'] to ['+logData.currency_new+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         
         if(logData.invoice_to_old!=logData.invoice_to_new){
            saveData[i++] = [logData.price_master_id,'Changed Invoice Sent To from ['+logData.invoice_to_old+'] to ['+logData.invoice_to_new+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         if(logData.invoice_cc_old!=logData.invoice_cc_new){
            saveData[i++] = [logData.price_master_id,'Changed Invoice Sent CC from ['+logData.invoice_cc_old+'] to ['+logData.invoice_cc_new+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         if(logData.invoice_type_old != logData.invoice_type_new){
            saveData[i++] = [logData.price_master_id,'Changed Invoice Type from ['+config.InvoiceType[logData.invoice_type_old]+'] to ['+config.InvoiceType[logData.invoice_type_new]+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         }
         
         if(logData.price_type_old != logData.price_type){
            saveData[i++] = [logData.price_master_id,'Changed Price Type from ['+config.PriceType[logData.price_type_old]+'] to ['+config.PriceType[logData.price_type]+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         } 

         if(logData.approval_status_old != logData.approval_status_new){
            saveData[i++] = [logData.price_master_id,'Changed Approval Status from ['+config.ApprovalStatus[logData.approval_status_old]+'] to ['+config.ApprovalStatus[logData.approval_status_new]+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by];
         } 

         let err  = null;
         if(saveData.length > 0){
            return db.query(`INSERT INTO price_log (price_master_id, log_text , created , modified , created_by , modified_by) VALUES ?`, [saveData],function(err,result){

                if(err){
                    throw err;
                }else{
                    if(logData.client_status_old!=logData.client_status_new){
                        Price.getpriceIdByClient(client_id ,function(err,pList){
                            if(err){
                                throw err;
                            }else{
                                var saveDataClientStatus = [];
                                var i = 0;
                                pList.forEach(function(row){
                                    saveDataClientStatus[i++]= [row.id,'Changed Client Status from ['+config.ClientStatus[logData.client_status_old]+'] to ['+config.ClientStatus[logData.client_status_new]+'] ',logData.created,logData.modified, logData.created_by, logData.modified_by]
                                }) ;
                                if(saveDataClientStatus.length > 0){
                                    return db.query(`INSERT INTO price_log (price_master_id, log_text , created , modified , created_by , modified_by) VALUES ?`, [saveDataClientStatus],callback);
                                }else{
                                    callback(err,result);
                                }
                           }
                        });
                        
                    }else{
                        callback(err,result);
                    }
                }
            });
         }else{            
            callback();
         }
    }
    ,getPriceLog: function(pricemasterId, parent_id, resprice, callback){
        if(parent_id==0){
           // console.log(resprice);
           return db.query(`select PriceLog.*, (select concat(	first_name, ' ',last_name) from user User where User.id = PriceLog.created_by) as created_user , PriceMaster.parent_id from price_log as PriceLog inner join price_master as PriceMaster on PriceMaster.id=PriceLog.price_master_id WHERE PriceLog.price_master_id= ?   order by PriceLog.created desc`, [pricemasterId],callback );
            
        }else{
            Price.getPriceDetail(parent_id,function(err,result){
                if(result.length>0){
                Price.getPriceLog(parent_id,result[0].parent_id, resprice, function(err,result2,fields) {
                    if(result2.length>0){
                      resprice.push(result2);
                    }
                  //  console.log(result2);
                return db.query(`select PriceLog.*, (select concat(	first_name, ' ',last_name) from user User where User.id = PriceLog.created_by) as created_user ,PriceMaster.parent_id from price_log as PriceLog inner join price_master as PriceMaster on PriceMaster.id=PriceLog.price_master_id WHERE PriceLog.price_master_id= ?  order by PriceLog.created desc `, [pricemasterId],callback );
            });
        }else{
            callback(err,result);
        }
        });
        }
    
    },
    getPriceHeads : function(priceId, callback){
        let idToUse;
        if(Array.isArray(priceId)){
            idToUse = priceId.join();
        }else{
            idToUse = priceId;
        }
        let query = `SELECT GROUP_CONCAT(invoice_item) as pricingHeads FROM price_master WHERE id IN (${idToUse})`;
        return db.query(query, callback);
    },
    getAllPriceHeadsByClient(clientId, callback){
        let query = `SELECT
        PriceMaster.*,        
        IF(PriceMaster.status= 'A','Active', IF(PriceMaster.status= 'S','Suspended','Inactive'))as price_status,
        (SELECT CONCAT(first_name, ' ',last_name) FROM user Employee WHERE PriceMaster.ao_id = Employee.id) AS ao_name,
        (SELECT CONCAT(first_name, ' ',last_name) FROM user Employee WHERE PriceMaster.account_manager_id = Employee.id) AS am_name,
        (SELECT CONCAT(first_name, ' ',last_name) FROM user Employee WHERE PriceMaster.i_empid = Employee.id) AS pm_name
        FROM price_master  PriceMaster 
        WHERE 1
        AND PriceMaster.i_clientid = '${clientId}'
        GROUP BY PriceMaster.invoice_item         
        ORDER BY modified DESC`;
        return db.query(query, callback);
    },
    suspendPriceHead : (priceHeadId, callback) => {
        let query = `UPDATE price_master SET status = 'S' WHERE id = '${priceHeadId}'`;
        return db.query(query, callback);
    },
    getSuspendedPriceHeads: (callback) => {
        let query = `SELECT PriceMaster.*,
        Client.v_company as client_name,
        CONCAT(ProjectManager.first_name, ' ',ProjectManager.last_name) as pm_name 
        FROM price_master PriceMaster 
        JOIN tbl_client  Client ON(Client.i_clientid = PriceMaster.i_clientid)
        JOIN user ProjectManager  ON(ProjectManager.id = PriceMaster.i_empid)
        WHERE PriceMaster.status = 'S'`;
        return db.query(query, callback);
    },
    resumePriceHeads : (priceMasterId, callback) => {
        // console.log(priceMasterId);
        return db.query(`UPDATE price_master SET status = 'A' WHERE id IN (?)`, [priceMasterId], callback); 
    },
    getPriceHeadName : function(ids, callback){        
        return db.query(`SELECT GROUP_CONCAT(PriceMaster.invoice_item) as head_name
        FROM price_master as PriceMaster WHERE id IN (?)`,[ids], callback)    
    },
    getMailRecipients : function(priceMasterId, postData, callback){
        let priceHeadsMailRecipients = postData.i_empid+','+postData.account_manager_id+','+postData.ao_id;
        User.getReportingManager(postData.i_empid)
        .then(
            function(reportingManagerData){
                priceHeadsMailRecipients +=','+reportingManagerData.id;
                //console.log(priceHeadsMailRecipients);
                let query = `SELECT 
                GROUP_CONCAT( DISTINCT User.email) as mail_recipients 
                FROM user User 
                JOIN user_role_access RoleAccess ON(User.id = RoleAccess.user_id) 
                WHERE 
                RoleAccess.role_id IN(1) 
                OR (User.id IN(${priceHeadsMailRecipients}) AND RoleAccess.role_id IN(2,3,4))`;
                return db.query(query, callback);
            }, 
            function(err){
                console.log(err);
                callback();
            });
        
        
       
    }
};
module.exports = Price;