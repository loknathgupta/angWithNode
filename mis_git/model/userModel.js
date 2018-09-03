var db = require('./db');

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function updateUserRoleAccess(userRoleDataToUpdate, callback){
    let query = `SELECT 
    GROUP_CONCAT(role_id) as accessed_roles
    FROM user_role_access
    JOIN user ON(user.id = user_role_access.user_id)
    WHERE user.id = '${userRoleDataToUpdate.user_id}'`;
    return db.query(query, function(err, userRoleData){
        if(err){
            callback(err, userRoleData);
        }else{
            console.log(userRoleData);
            let userRoleDataToAdd = {
                user_id : userRoleDataToUpdate.user_id,
                created_by : userRoleDataToUpdate.modified_by
            }
            //console.log(userRoleDataToAdd);
            let existingRoles =  userRoleData[0]['accessed_roles']; 
            let rolesToGrandAccess = rolesToGrandAccessToMatch = roleAccessToRemove = roleAccessToAdd = [];
            if(Array.isArray(userRoleDataToUpdate.user_role_id)){           
                rolesToGrandAccess = userRoleDataToUpdate.user_role_id;
            }else{
                rolesToGrandAccess = [userRoleDataToUpdate.user_role_id];
            }
            if(existingRoles){     
                rolesToGrandAccessToMatch = rolesToGrandAccess.toString();
                if(rolesToGrandAccessToMatch != existingRoles){
                    existingRoles = existingRoles.split(',');
                    existingRoles = Array.from(new Set(existingRoles));
                    roleAccessToRemove = existingRoles.diff(rolesToGrandAccess);
                    roleAccessToAdd = rolesToGrandAccess.diff(existingRoles);
                }
            }else{
                roleAccessToAdd = rolesToGrandAccess;                
            }  
            if(roleAccessToRemove.length > 0){
                roleAccessToRemove = roleAccessToRemove.toString();                
                return db.query(`DELETE FROM user_role_access WHERE user_id = '${userRoleDataToUpdate.user_id}' AND role_id IN(${roleAccessToRemove})`, function(err, deleteStatus){
                    console.log(this.sql);
                    if(err){
                        callback(err, deleteStatus);
                    }else{
                        if(roleAccessToAdd.length > 0){
                            userRoleDataToAdd.user_role_id = roleAccessToAdd;
                            return addUserRoleAccess(userRoleDataToAdd, callback);
                        }else{
                            callback(err, deleteStatus);
                        }
                    }
                })
            }else{
                if(roleAccessToAdd.length > 0){
                    userRoleDataToAdd.user_role_id = roleAccessToAdd;
                    return addUserRoleAccess(userRoleDataToAdd, callback);
                }else{
                    callback(err, userRoleData);
                }
            }
        }
    });    
}
function addUserRoleAccess(userRoleDataToAdd, callback){
    let roleDataToSave = [];
    if(userRoleDataToAdd['user_role_id']){
        userRoleDataToAdd['user_role_id'].forEach(function(roleId){
            roleDataToSave.push([userRoleDataToAdd.user_id, roleId, userRoleDataToAdd.created_by, userRoleDataToAdd.created_by, new Date(), new Date()]); 
        });
   
        return db.query(`INSERT INTO user_role_access (user_id, role_id, created_by, modified_by, created, modified) VALUES ?`, [roleDataToSave], callback);
    }else{
        callback();
    }

}

var User = {
    getUsers : function(UserData, callback){
        let query = `SELECT 
        User.id, 
        User.first_name, 
        User.last_name,
        User.email,
        User.employee_code,
        User.status, 
        User.password, 
        GROUP_CONCAT(Role.name) as name,
        GROUP_CONCAT(Role.id) as user_role_id, 
        GROUP_CONCAT(Role.short_name) as short_name, 
        ReportingManager.id as reporting_manager_id,
        concat(ReportingManager.first_name, ' ', ReportingManager.last_name) as reporting_manager 
        FROM 
        user User
        JOIN user_role_access UserRoleAccess ON(UserRoleAccess.user_id = User.id)
        JOIN user_role Role ON (UserRoleAccess.role_id = Role.id)                                         
        LEFT JOIN user ReportingManager on User.manager_id = ReportingManager.id
        WHERE 1 `;
        if(UserData.id !== undefined){
            query  = query + ` AND User.id = ${UserData.id}`;
        }

        query  = query + ' GROUP BY User.id ORDER BY User.id desc';
        
        return db.query(query, callback);
    },
    isUserExists : function(conditions, callback){
        return db.query('select count(id) as count, id from user where '+ conditions, callback);
    },
    saveUser : function(userData, callback){
        let rolesToGrandAccess;
        if(Array.isArray(userData.user_role_id)){           
            rolesToGrandAccess = userData.user_role_id;
        }else{
            rolesToGrandAccess = [userData.user_role_id];
        }        
        userData.user_role_id = 1;
        return db.query('INSERT INTO user SET ?', userData, function(err, userSaveStatusData){
            if(err){
                callback(err, userSaveStatusData);
            }else{                
                let dataForRoleAccess = {
                    user_role_id : rolesToGrandAccess,
                    user_id : userSaveStatusData.insertId,
                    created_by : userData.created_by
                };
                return addUserRoleAccess(dataForRoleAccess, callback);
            }
        });
    },
    updateUser : function(fieldsWithValues, conditions, callback){
        let dataForRoleUpdate;
        if(fieldsWithValues.user_role_id){
            dataForRoleUpdate = {
                user_role_id : fieldsWithValues.user_role_id,
                user_id : fieldsWithValues.id,
                modified_by : fieldsWithValues.modified_by
            };
            fieldsWithValues.user_role_id = 1;
        }
        return db.query('UPDATE user SET ? WHERE ?', [fieldsWithValues, conditions], function(err, userUpdateStatus){
            if(err){
                callback(err, userUpdateStatus);
            }else{
                if(fieldsWithValues.user_role_id){
                    return updateUserRoleAccess(dataForRoleUpdate, callback);
                }else{
                    callback(err, userUpdateStatus);
                }
            }
        });
    },
    getUserForLogin: function(userData, callback){
        return db.query('SELECT user.*, (select group_concat(role_id)from user_role_access UserRoleAccess where UserRoleAccess.user_id = user.id)as user_role, (select group_concat(user_role.short_name)from user_role_access UserRoleAccess inner join user_role on UserRoleAccess.role_id = user_role.id where UserRoleAccess.user_id = user.id) as short_name FROM user  WHERE email=?', [userData.email], callback);
    },
    getRoles: function(callback){
        return db.query('SELECT id,name FROM user_role', callback);
    },
    getReportManager: function(userData, callback){
        //let conditions = 'User.user_role_id != 3';
        let conditions = '1';
        if(userData.userBeingEdit){
            conditions = conditions + ` AND User.id != '${userData.userBeingEdit}' `;
        }
        let query = `SELECT 
        User.id, 
        CONCAT(User.first_name,' ',User.last_name) as reporting_manager 
        FROM user User 
        WHERE ${conditions}`;
        // console.log(query);
        return db.query(query, callback);       
    },
    exportUserFromMis: function(req,callback){
         db2.query('SELECT * FROM users WHERE 1 ORDER BY id desc', function (err, result){
            if (err) throw err;
            
            Object.keys(result).forEach(function(key) {
                var row = result[key];
                var userType = 1;
                       if(row.user_type=='SA'){
                           userType = 3;
                       }else if(row.user_type=='IU'){
                          userType = 2; 
                       }
                var userData = {
                            first_name: row.first_name,
                            last_name: row.last_name,
                            email: row.email,
                            password: row.password,
                            user_role_id: userType,
                            status: row.status,
                            mis_user_id: row.id,
                            mis_client_id: 0,
                            last_login:null,
                            
                        };
                db.query('SELECT * FROM user WHERE email=?', [row.email],function (err, rowData){
                    if(rowData.length > 0){
                       // var password = crypto.createHash('md5').update('123456').digest('hex');
                       // console.log(password);
                       
                      // console.log(row.first_name); 
                       
                        User.updateUser(userData,{email:rowData[0].email},function(){});
                    }else{
                        User.saveUser(userData,function(){});
                    }
                });
                
            });
        });
    },
    getReportingManager : function(userId){
        return new Promise(function(resolve, reject){
            let query = `SELECT Manager.* FROM user Manager JOIN user User ON(Manager.id = User.manager_id) WHERE User.id = '${userId}'`;
            db.query(query, function(err, reportingManagerData){
                if(err){
                    reject(err);
                }else{
                    resolve(reportingManagerData[0]);
                }
            })
        });
    },
    getOnlineUsersForChat : function(){
        return new Promise(function(resolve, reject){
            db.query('SELECT data FROM sessions', function(err, liveUsersData){
                console.log(this.sql);
                if(err){
                    reject(err);
                }else{
                    //console.log(liveUsersData);
                    resolve(liveUsersData);
                }
            })
        });
    }

};
module.exports = User;