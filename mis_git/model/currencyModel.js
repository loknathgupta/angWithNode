var db = require('./db');

var Currency = {

    getAllCurrency : function(callback){
        
        return db.query('SELECT value FROM currency order by value', callback);
    
},
};
module.exports = Currency;