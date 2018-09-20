var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost:27017/test_app';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise; 
var db = mongoose.connection;
//console.log(db);
db.on('error', console.error.bind(console, 'MongoDB connection error:'));