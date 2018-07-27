const db = require('./db');

var User ={
    getUsers : function(options, callback){
        let query = `SELECT * FROM hero`;
        return db.query(query, callback);
    },
    saveUser : function(userData, callback){
        return db.query(`INSERT INTO hero SET ?`, userData, callback);
    }
}
module.exports = User;