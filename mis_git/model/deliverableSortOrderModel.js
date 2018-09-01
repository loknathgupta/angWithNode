var db = require('./db');
var moment = require('moment');

var DeliverableSortOrder = {    
    updatePriceHeadSortOrder: function (requestData, loggedInUserData, callback) {
        let priceHeadsWithType = requestData.priceHeadsWithSortOrder.split(',');
        let userId = loggedInUserData.id;
        db.query(`SELECT CONCAT(price_master_id, '_', price_type) as price_heads_order FROM deliverables_sort_order WHERE user_id = '${userId}'`, function (err, resultData) {
            if(err){
                callback(err, resultData);
            }else{
                let existingPriceHeads = [];
                if(resultData){
                    resultData.forEach(function(priceHeadsOrder){
                        existingPriceHeads.push(priceHeadsOrder['price_heads_order']);
                    });
                }
                //return console.log(existingPriceHeads);
                let order = 1;
                let sortOrderDataToSave = [];
                let UpdateQuery = ``;
                priceHeadsWithType.forEach(function(priceHeadWithType){
                    let priceHeadDetials = priceHeadWithType.split('_');
                    let priceHead = priceHeadDetials[0];
                    let priceHeadType = priceHeadDetials[1];
                    if(existingPriceHeads && existingPriceHeads.indexOf(priceHeadWithType) != -1){
                        UpdateQuery += `UPDATE deliverables_sort_order 
                        SET sort_order = '${order}' 
                        WHERE 
                        price_master_id = '${priceHead}' 
                        AND user_id = '${userId}'
                        AND price_type = '${priceHeadType}';`;
                    }else{
                        sortOrderData = [ 
                            moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), //created 
                            priceHead, //price_master_id 
                            userId, //user_id 
                            order,  //sort_order
                            priceHeadType     //price_type
                        ];                        
                        sortOrderDataToSave.push(sortOrderData);
                    }
                    order++;
                });
                // console.log(UpdateQuery);
                // console.log(sortOrderDataToSave);
                let insertQuery = `INSERT INTO deliverables_sort_order 
                (created, price_master_id, user_id, sort_order, price_type) 
                VALUES ?`;
                // return console.log(UpdateQuery);

                if(UpdateQuery && sortOrderDataToSave.length > 0){
                    db.query(UpdateQuery, function(err, status){
                        if(err){
                            callback(err, status);
                        }else{
                            return db.query(insertQuery, [sortOrderDataToSave], callback);
                        }
                    })

                }else if(sortOrderDataToSave.length > 0){                    
                    return db.query(insertQuery, [sortOrderDataToSave], callback);
                }else{
                    db.query(UpdateQuery,callback);
                }
            }
        });
    }
}
module.exports = DeliverableSortOrder;