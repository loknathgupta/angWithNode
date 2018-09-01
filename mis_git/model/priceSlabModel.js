var db = require('./db');



var PriceSlab = {    
    getPricingSlabs : function(priceId, callback){
        return db.query(`SELECT GROUP_CONCAT(volume_from) as vfrom, GROUP_CONCAT(volume_to) as vto, GROUP_CONCAT(price) as vprice FROM slab_price where price_master_id = '${priceId}'`, callback);       
    }
};
module.exports = PriceSlab;