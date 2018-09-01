var db = require('./db');



var BillingCycle = {
    
    getBillingCycleAll : function(callback){
             return db.query('SELECT id,value FROM billing_cycle ORDER BY value', callback);       
    }
};
module.exports = BillingCycle;