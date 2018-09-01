var db = require('./db');
var moment = require('moment');

var Delivery = {    
    addChangeRequest: function (requestData, loggedInUserData, callback) {
        let query;
        let changeRequestData = [];
        let currentDate = new Date();
        if(requestData.volume == requestData.old_volume){
            let updateDate = moment(currentDate).format('YYYY-MM-DD');
            query = `UPDATE daily_deliverable SET
            description = '${requestData.description}',
            modified_by = '${loggedInUserData.id}',
            modified  = '${updateDate}'
            WHERE id = '${requestData.deliverable_id}'`;
        }else{
            changeRequestData = {
                daily_deverable_id: requestData.deliverable_id,
                volume: requestData.volume,
                description: requestData.description,
                status: 'P',
                created: moment(currentDate).format('YYYY-MM-DD HH:mm:ss'), //created_date
                modified: moment(currentDate).format('YYYY-MM-DD HH:mm:ss'), //modified_date
                created_by:  loggedInUserData.id, //created_by
                modified_by: loggedInUserData.id //modified_by
            }
            query = `INSERT INTO daily_deliverable_change_req SET ?`;
        } 
        console.log(query);       
        console.log(loggedInUserData);       
        return db.query(query, [changeRequestData], callback);
    },
    getAllChangeRequest:function(conditions, callback){
        let query = `SELECT 
        ChangeRequest.id as request_id,
        ChangeRequest.volume as requested_volume,
        ChangeRequest.created as requested_on,
        ChangeRequest.description as requested_description,
        DailyDeliverable.id as deliverable_id,
        DailyDeliverable.delivery_date as delivery_date,
        DailyDeliverable.volume as current_volume,
        DailyDeliverable.description as current_description,
        PriceMaster.invoice_item,
        PriceMaster.price_per_unit,
        PriceMaster.price_unit,
        PriceMaster.currency,
        CONCAT(User.first_name, ' ', User.last_name) as requested_by,
        (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name
        FROM daily_deliverable_change_req ChangeRequest
        JOIN daily_deliverable DailyDeliverable on(ChangeRequest.daily_deverable_id = DailyDeliverable.id)
        JOIN price_master PriceMaster ON(DailyDeliverable.price_master_id = PriceMaster.id)
        JOIN user User ON(User.id = ChangeRequest.created_by)
        WHERE ChangeRequest.status = 'P' `;
        return db.query(query, callback);
    },
    updateChangeRequestStatus : function(requestData, loggedInUserData, callback){
        let status, requestId, comment, deliveryId, requestedVolume, requestedDescrition;
        let currentDate =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        if(requestData.updateStatus == 1){
            status = 'A';
        }else{
            status = 'R';
        }
        requestId = requestData.requestId;
        comment = requestData.comment;
        let query = `SELECT * FROM daily_deliverable_change_req WHERE id = '${requestId}'`;

        db.query(query, function(err, result){
            if(err){
                callback(err, result);
            }else{   
                deliveryId = result[0]['daily_deverable_id'];  
                requestedVolume =  result[0]['volume'];  
                requestedDescription  =  result[0]['description'];  
                query = `UPDATE daily_deliverable_change_req SET 
                status = '${status}',
                comment = '${comment}',
                modified  = '${currentDate}',
                modified_by = '${loggedInUserData.id}'
                WHERE id = '${requestId}'`;
                db.query(query, function(err, statusData){
                    if(err){
                        callback(err, statusData);
                    }else{
                        if(statusData.affectedRows && status == 'A'){
                            query = `UPDATE daily_deliverable SET
                            volume = '${requestedVolume}',
                            description = '${requestedDescription}',
                            modified  = '${currentDate}',
                            modified_by = '${loggedInUserData.id}'
                            WHERE id = '${deliveryId}'`;
                            //console.log(query);
                            db.query(query, callback);
                        }else{
                            callback(err, statusData);
                        }
                    }
                })

            }
        })
    },
    getChangeRequestDetails: function(requestId, callback){
        let query = `SELECT
        Client.v_company, 
        DailyDeliverable.delivery_date
        FROM 
        daily_deliverable_change_req ChangeRequest
        JOIN daily_deliverable DailyDeliverable ON (ChangeRequest.daily_deverable_id = DailyDeliverable.id)
        JOIN price_master PriceMaster ON (DailyDeliverable.price_master_id = PriceMaster.id)
        JOIN tbl_client Client ON (PriceMaster.i_clientid = Client.i_clientid)
        WHERE ChangeRequest.id = ${requestId}  
        `;
        return db.query(query, callback);
    }
};
module.exports = Delivery;