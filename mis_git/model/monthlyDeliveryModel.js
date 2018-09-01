var db = require('./db');
var moment = require('moment');

var MonthlyDelivery = {
    addMonthlyDelivery: function (priceMasterId, requestData, volumeForUserType, loggedInUserData, monthsHavingVolumes, callback) {
        let monthlyDataToSave = [];
        let monthsToDelete = [0];
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth()+1;
        let currentYear = currentDate.getFullYear();
        monthlyDeliverableDefault = [
            moment(currentDate).format('YYYY-MM-DD HH:mm:ss'), //created_date
            moment(currentDate).format('YYYY-MM-DD HH:mm:ss'), //modified_date
            loggedInUserData.id, //created_by
            loggedInUserData.id, //modified_by
            volumeForUserType, //user_type
            currentYear //year
        ];
        Object.keys(requestData).forEach(function (month) {
            newMonthyDeliverabel = monthlyDeliverableDefault.slice();
            newMonthyDeliverabel.push(month); //month
            newMonthyDeliverabel.push(priceMasterId); //price_master_id
            newMonthyDeliverabel.push(requestData[month]); //volume
            if(requestData[month]){
                monthlyDataToSave.push(newMonthyDeliverabel);
                if(month > currentMonth){
                    monthsToDelete.push(month);
                }
            }
            
        });  
        // console.log(monthsToDelete);     
        // console.log(monthlyDataToSave);     
        monthsToDelete = monthsToDelete.toString();
        return db.query(`DELETE FROM monthly_volume WHERE user_type = '${volumeForUserType}' AND  year= '${currentYear}' AND price_master_id = '${priceMasterId}' AND month IN (${monthsToDelete})`, function(err, status){
            if(err){
                console.log(err);
                console.log('Error in deletion from monthly_volume.....');
            }else{
                if(monthlyDataToSave.length > 0){                    
                    return db.query(`INSERT INTO monthly_volume 
                    (created , modified , created_by , modified_by, user_type, year, month, price_master_id, volume) VALUES ?`,
                    [monthlyDataToSave],
                    callback
                    );
                }else{
                    callback(err, status);
                }
            }
        })
    },
    getProjectedVolumes : function(priceMasterId, volumeForUserType, loggedInUserData, callback){
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth()+1;
        let currentYear = currentDate.getFullYear();
        let userType = volumeForUserType;
        let query = `SELECT 
        PriceMaster.invoice_item, 
        PriceMaster.price_unit, 
        PriceMaster.description,
        (SELECT GROUP_CONCAT(month) as months FROM monthly_volume WHERE price_master_id = '${priceMasterId}' AND year='${currentYear}' AND user_type='${userType}' ORDER BY month ASC) as inserted_months,
        (SELECT GROUP_CONCAT(volume) as volumes FROM monthly_volume WHERE price_master_id = '${priceMasterId}' AND year='${currentYear}' AND user_type='${userType}' ORDER BY month ASC) as inserted_volumes,
        (SELECT GROUP_CONCAT(modified) as m_date FROM monthly_volume WHERE price_master_id = '${priceMasterId}' AND year='${currentYear}' AND user_type='${userType}' ORDER BY month ASC) as added_on,
        (SELECT GROUP_CONCAT(CONCAT(first_name, ' ', last_name)) as m_user FROM monthly_volume JOIN user on (user.id  = monthly_volume.modified_by) WHERE price_master_id = '${priceMasterId}' AND year='${currentYear}' AND user_type='${userType}' ORDER BY month ASC) as added_by
        FROM price_master PriceMaster
        WHERE PriceMaster.id = '${priceMasterId}'`;
        return db.query(query, callback)
    },
    addMonthlyDeliverySheet : function(sheetData, callback){
        return db.query('INSERT INTO monthly_volume_sheet SET ?', [sheetData], callback);
    },
    getMonthlyDeliverySheet : function(sheetData, callback){
        let query = `SELECT * FROM monthly_volume_sheet 
        WHERE
        price_master_id = '${sheetData.price_master_id}' 
        AND month = '${sheetData.month}'
        AND year = '${sheetData.year}'
        `;
        return db.query(query, callback);
    },
    deleteMonthlyDeliverySheet : function(sheetData, callback){
        let query = `SELECT * FROM monthly_volume_sheet 
        WHERE
        price_master_id = '${sheetData.price_master_id}' 
        AND month = '${sheetData.month}'
        AND year = '${sheetData.year}'
        AND is_custom_price = '${sheetData.isCustomPrice}'`;
        return db.query(query, function(err, sheets){
            query = `DELETE FROM monthly_volume_sheet 
            WHERE
            price_master_id = '${sheetData.price_master_id}' 
            AND month = '${sheetData.month}'
            AND year = '${sheetData.year}'
            AND is_custom_price = '${sheetData.isCustomPrice}'`;
            return db.query(query, callback(err, sheets));
        });
    }
};
module.exports = MonthlyDelivery;