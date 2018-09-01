var db = require('./db');
var dbMis = require('./db_mis');


var Client = {

    getClientAll : function(callback){
             return db.query('SELECT i_clientid, v_company  FROM tbl_client where c_status=\'A\' ORDER BY v_contactname', callback);       
    },
    saveClient : function(clientData, callback){
        return db.query('INSERT INTO tbl_client SET ?', clientData, callback)
    },
    updateClient : function(fieldsWithValues, conditions, callback){
        return db.query('UPDATE tbl_client SET ? WHERE ?', [fieldsWithValues, conditions], callback)
    },
    exportClientFromMis: function(req,callback){
        dbMis.query('SELECT * FROM tbl_client ORDER BY i_clientid desc', function (err, result){
           if (err) throw err;
           
           Object.keys(result).forEach(function(key) {
               var row = result[key];
              // console.log(row);
               var clientData = row
              // console.log(clientData);
               db.query('SELECT * FROM tbl_client WHERE i_clientid=?', [row.i_clientid],function (err, rowData){ //console.log(rowData);
                   if(rowData.length > 0){
                                            
                       Client.updateClient(clientData,{i_clientid:rowData[0].i_clientid},function(){});
                   }else{
                       Client.saveClient(clientData,function(){});
                   }
               });
               
           });
           callback();
       });
   }
};
module.exports = Client;