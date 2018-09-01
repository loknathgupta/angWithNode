var mysql = require('mysql');

var con = mysql.createConnection({
    host: "127.0.0.1",
    user:"root",
    password:"",
    database:"mis_invoice",
    //database:"mis_live",
    multipleStatements: true
});

con.connect((err) => {
    if (err){
        console.log(err.message);
    }else{
    console.log('Connected!');
    }
  });
module.exports = con;
