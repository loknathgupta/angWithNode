var db = require('./db');



var ActivityLog = {
    logActivity : function(activityData, callback){        
        delete activityData.requestData;
        delete activityData.modelUsed;
        let query = `INSERT INTO activity_log SET ?`;
        if(activityData.action != 'View'){            
            return db.query(query, [activityData],callback); 
        }else{
            return callback();
        }
    },
    getLogs : function(conditions, callback){
        let query = `SELECT 
        ActivityLog.page_url, 
        ActivityLog.created, 
        ActivityLog.message,
        ActivityLog.action,
        CONCAT(User.first_name, ' ', User.last_name) as done_by 
        FROM activity_log ActivityLog
        JOIN user User On(User.id = ActivityLog.created_by)
        WHERE action != 'View'`; 
        return db.query(query, callback);
    }
};
module.exports = ActivityLog;