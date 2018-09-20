const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    last_name: {type: String,  max: 100},
    email: {type: String, required: true},
    role: {type: String, required: true},
    status: {type: String, required: true},
    created: {type: Date, default: Date.now}
});

userSchema.statics.getUsers = function() {
    return new Promise(function(resolve, reject){
        this.find(function(err, users){
            if(err){
                console.log(err);
                reject(err);
            }else{
                resolve(users);
            }
        });

    });
  
}


// Export the model
module.exports = mongoose.model('user', userSchema);