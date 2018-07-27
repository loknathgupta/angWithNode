const mysql = require('mysql');
const db = mysql.createConnection({
    user: 'root',
    password : '',
    database : 'angTest'
});
db.connect((err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log('Connected to DB');
    }
});
module.exports = db;