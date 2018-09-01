var db = require('./db');



var CreditPeriod = {
   
    getCreditPeriodAll : function(callback){
             return db.query('SELECT id,value  FROM credit_period ORDER BY value', callback);       
    }
};
module.exports = CreditPeriod;