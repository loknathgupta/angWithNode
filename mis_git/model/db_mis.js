var mysql = require('mysql');

var conMis = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"",
    database:"mis_invoice",
    insecureAuth:true

});

conMis.connect((err) => {
    if (err) throw err;
    console.log('Connected to DB2!');
  });
module.exports = conMis;
