var env = require('dotenv').load();
var mysql = require('mysql');

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    //database:"mis_live",
    multipleStatements: true,
    //debug: true
});

con.connect((err) => {
    if (err){
        console.log(err.message);
    }else{
    console.log('Connected to DB!');
    }
  });
module.exports = con;
