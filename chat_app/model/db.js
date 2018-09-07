var mongo = require('mongodb');
var dbUrl = "mongodb://localhost:27017";
var MongoClient = mongo.MongoClient;
var db;
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, client) {
    if (err){ 
        console.log('Error here....')
        next(err);
    }

    //console.log("Database connected...");
    //db = client.db('chat_db');
    //console.log(db);
});
module.exports = db;
