var db = require('./db');
var moment = require('moment');

var CustomPrice = {
    addCustomPrice: function(requestData, loggedInUserData, callback){
        let currentDate = moment(new Date()).format('YYYY-MM-DD');
        requestData.created = new Date();
        requestData.modified = new Date();
        requestData.created_by = loggedInUserData.id;
        requestData.modified_by = loggedInUserData.id;
        if(!requestData.account_manager_id || requestData.account_manager_id == ''){
            delete requestData.account_manager_id;
        }
        requestData.status = 'P';
        //console.log(requestData);
        return db.query(`INSERT INTO custom_price_master SET ?`, [requestData], callback);       


    },  
    getAllPendingCustomPrices:function(conditions, callback){
        let query = `SELECT 
        CustomMaster.id as request_id,
        CustomMaster.volume as requested_volume,
        CustomMaster.created as requested_on,
        CustomMaster.description as requested_description,             
        CustomMaster.price_per_unit,   
        CustomMaster.invoice_item,
        CustomMaster.price_unit,
        CustomMaster.currency,        
        CONCAT(User.first_name, ' ', User.last_name) as requested_by,
        (select v_company from tbl_client Client where CustomMaster.i_clientid = Client.i_clientid) as client_name
        FROM custom_price_master CustomMaster
        JOIN user User ON(User.id = CustomMaster.created_by)
        WHERE CustomMaster.status = 'P' `;
        return db.query(query, callback);
    },

    updateCustomPrice : function(requestData, loggedInUserData, callback){
        let status, requestId, comment, deliveryId, requestedVolume, requestedDescrition;
        let currentDate =  moment(new Date()).format('YYYY-MM-DD');
        if(requestData.updateStatus == 1){
            requestData.status = 'A';
        }else{
            requestData.status = 'R';
        }
        requestData.approval_comment = requestData.description; 
        requestData.modified = new Date();
        requestData.modified_by = loggedInUserData.id;

        requestId = requestData.requestId;

        delete requestData.requestId;
        delete requestData.description;
        delete requestData.updateStatus;
        delete requestData.currency;

        comment = requestData.comment;
        let query = `UPDATE custom_price_master SET ?
        WHERE id = '${requestId}'`;
        db.query(query, [requestData], callback);        
    },
    getCustomPriceDetails: function(customPriceId, callback){
        let query = `SELECT
        Client.v_company, 
        CustomPriceMaster.*
        FROM 
        custom_price_master CustomPriceMaster
        JOIN tbl_client Client ON (CustomPriceMaster.i_clientid = Client.i_clientid)
        WHERE CustomPriceMaster.id = ${customPriceId}  
        `;
        return db.query(query, callback);
    },

    getCustomPriceHeadsForMonth: function (requestData){
        return new Promise(function(resolve, reject){
            var selectedMonthStartDate = new Date(requestData.dateSelected);
            selectedMonthStartDate.setDate(1);
            var selectedMonthEndDate = new Date(selectedMonthStartDate);
            selectedMonthEndDate.setMonth(selectedMonthStartDate.getMonth()+1);
            selectedMonthEndDate.setDate(selectedMonthStartDate.getDate()-1);
            var currentMonth = selectedMonthStartDate.getMonth();
            var currentYear = selectedMonthStartDate.getFullYear();
            let customPriceMasterRetrievalCondition = 1;
            let retrievalRole = requestData.retrievalRole;
            selectedMonthStartDate = moment(selectedMonthStartDate).format('YYYY-MM-DD');
            selectedMonthEndDate = moment(selectedMonthEndDate).format('YYYY-MM-DD');
            if (retrievalRole == 'PM') {
                customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND CustomPriceMaster.i_empid = '${requestData.projectManagerId}'`;
            } else if (retrievalRole == 'AM') {
                if (requestData.accountManagerId != 'All') {
                    customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND CustomPriceMaster.account_manager_id = '${requestData.accountManagerId}'`;
                }
            }
    
            if (requestData.priceHeadStatus != 0) {
                //customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND CustomPriceMaster.status = '${requestData.priceHeadStatus}'`;
            }
    
           if (requestData.clientStatus == 2) {
                if (requestData.clientStatus != 1) {
                    //customPriceMasterRetrievalCondition = customPriceMasterRetrievalCondition + ` AND 0`;
                }
            }

            let query = `SELECT CustomPriceMaster.id as price_master_id,
            CustomPriceMaster.i_empid, 
            invoice_item,
            null as status,
            price_unit,
            start_date as delivery_date,
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
            0 as sort_order
            FROM custom_price_master CustomPriceMaster
            WHERE (CustomPriceMaster.start_date BETWEEN '${selectedMonthStartDate}' AND '${selectedMonthEndDate}')
            AND ${customPriceMasterRetrievalCondition}
            AND status != 'R'
            ORDER BY CustomPriceMaster.start_date DESC`;
            //console.log(query);
            return db.query(query, function(err, priceHeadData){
                if(err){
                    reject(err);
                }else{
                    resolve(priceHeadData);
                }
            });
            
        });
    }
      
};
module.exports = CustomPrice;