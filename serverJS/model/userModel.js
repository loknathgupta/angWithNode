const db = require('./db');

var User ={
    getUsers : function(options, callback){
        let query = `SELECT * FROM hero`;
        return db.query(query, callback);
    },
    saveUser : function(userData, callback){
        return db.query(`INSERT INTO hero SET ?`, userData, callback);
    },
    deleteUser : function(userID, callback){
        let sql = `DELETE FROM hero WHERE id = '${userID}'`;
        db.query(sql, callback);
    },
    updateUser : function(userData, callback){
        let userId = userData.id;
        return db.query(`UPDATE hero SET ? WHERE id=?`, [userData, userId], callback);
    },
}
module.exports = User;