var db = require('./db');
var User = require('./userModel');
var request = require('request');
var apiConfig = require('../apiConfig');

var API = {
    callWMSPriceHeadAPI : function(priceHeadId, action){
        let query = `SELECT 
        PriceMaster.id as pricing_head_id,
        PriceMaster.parent_id as parent_id,
        PriceMaster.invoice_item as pricing_head_name,
        PriceMaster.i_clientid as client_id, 
        PriceMaster.i_empid,       
        DATE(PriceMaster.start_date) as start_date,
        DATE(PriceMaster.end_date) as end_date,
        PriceMaster.price_unit as unit_of_mesurement,
        PriceMaster.status,
        Client.v_company as client_name,        
        PM.employee_code as pm_emp_code,
        AM.employee_code as am_emp_code,
        AO.employee_code as ao_emp_code
        FROM price_master PriceMaster
        JOIN user PM ON (PriceMaster.i_empid = PM.id)
        JOIN user AO on (PriceMaster.ao_id = AO.id)
        LEFT JOIN user AM on (PriceMaster.account_manager_id = AM.id)
        JOIN tbl_client Client ON(PriceMaster.i_clientid = Client.i_clientid)
        WHERE PriceMaster.id = '${priceHeadId}'`;
        return db.query(query, function(err, priceHeadData){
            let priceDataToPost = priceHeadData[0];
            if(action != 'add'){
                action = 'update';
            }
            priceDataToPost.action = action;
            User.getReportingManager(priceDataToPost.i_empid)
            .then(
                function(reportingManager){
                    priceDataToPost.gm_emp_code = reportingManager.employee_code;
                    console.log(priceDataToPost);

                    request.post({
                        "headers": { "athenticationKey": "1234567890" },
                        "url": apiConfig.WebServer+"/api/project",
                        "form": priceDataToPost
                    }, function(err, res, body){
                        if(err) {
                            return console.log(err);
                        }
                        console.log(body);
                        console.log('API CALL DONE');
                    });
                },
                function(err){
                    console.log(err);
                }
            );
            
        });
    }    
};
module.exports = API;