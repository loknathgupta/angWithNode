const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    _id : Schema.Types.ObjectId,
    first_name: {type: String, required: true, max: 100},
    last_name: {type: String,  max: 100},
    email: {
        type: String,
        validate: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, 
        required: true, 
        index: true, 
        unique: true },
    password : {type: String, required: true},
    role: {type: String, required: true},
    status: {type: String, required: true},
    created: {type: Date, default: Date.now}
});

userSchema.statics.getUsers = function() {
    return new Promise((resolve, reject)=>{
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

userSchema.set('autoIndex', false);

// Export the model
module.exports = mongoose.model('user', userSchema);