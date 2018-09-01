var db = require('./db');



var Employee = {
    
    getPMAll : function(callback){
             return db.query("SELECT distinct User.id, concat(User.first_name,' ' ,User.last_name) as pm_name  FROM user User inner join user_role_access UserRoleAccess on UserRoleAccess.user_id = User.id inner join user_role UserRole on UserRoleAccess.role_id = UserRole.id  where UserRole.short_name ='PM' and status in ('A','L') ORDER BY concat(User.first_name,' ' ,User.last_name) asc", callback);       
    },
    getAMAll : function(callback){
        let query = `SELECT 
        User.id, 
        CONCAT(User.first_name,' ' ,User.last_name) as am_name  
        FROM 
        user User
        JOIN user_role_access UserRoleAccess ON(UserRoleAccess.user_id = User.id)
        JOIN user_role UserRole ON (UserRoleAccess.role_id = UserRole.id)
        WHERE UserRole.short_name ='AM' 
        AND status IN ('A','L') 
        ORDER BY CONCAT(User.first_name,' ' ,User.last_name) ASC`;
        return db.query(query, callback);
    },
    getAOAll : function(callback){
        return db.query("SELECT distinct User.id, concat(User.first_name,' ' ,User.last_name) as ao_name  FROM user User inner join user_role_access UserRoleAccess on UserRoleAccess.user_id = User.id inner join user_role UserRole on UserRoleAccess.role_id = UserRole.id  where UserRole.short_name ='AO' and status in ('A','L') ORDER BY concat(User.first_name,' ' ,User.last_name) asc", callback);       
    },
    getPMByAM : function(accountManagerId, callback){
        let condition = "UserRole.short_name ='PM' and User.status IN ('A','L')";
        if(accountManagerId > 0){
            condition =  condition + " AND PriceMaster.account_manager_id = "+accountManagerId;
        }
        let query = `SELECT 
        User.id, 
        concat(User.first_name,' ' ,User.last_name) as pm_name  
        FROM user User
        JOIN user_role UserRole ON (User.user_role_id = UserRole.id)
        LEFT JOIN price_master PriceMaster ON(PriceMaster.i_empid = User.id)
        where ${condition} 
        GROUP BY User.id 
        ORDER BY concat(User.first_name,' ' ,User.last_name) desc`;
        return db.query(query, callback);       
    },
    getPMByHigherManger : function(HigherMangerId, HigherMangerRole, callback){
        let condition = "Role.short_name ='PM' and User.status IN ('A','L')";
        let userBasedCondition = '1';
        let managerCondition = '';
        // console.log(HigherMangerRole);
        if(HigherMangerId > 0){            
            if(HigherMangerRole.indexOf('AM') != -1){
                managerCondition =  " PriceMaster.account_manager_id = "+HigherMangerId;
            }
            if(HigherMangerRole.indexOf('GM') != -1){
                managerCondition =  " User.manager_id = "+HigherMangerId;
            }
        }
        if(managerCondition != ''){
            userBasedCondition = userBasedCondition + " AND "+managerCondition;
        }
        // console.log(userBasedCondition);

        if(HigherMangerRole.indexOf('PM') != -1){
            userBasedCondition =   " (( "+userBasedCondition + ") OR User.id = "+HigherMangerId+")";
        }
        condition = condition+" AND "+userBasedCondition;
        let query = `SELECT 
        User.id, 
        concat(User.first_name,' ' ,User.last_name) as pm_name  
        FROM user User
        JOIN user_role_access UserRoleAccess ON(UserRoleAccess.user_id = User.id)
        JOIN user_role Role ON (UserRoleAccess.role_id = Role.id)
        LEFT JOIN price_master PriceMaster ON(PriceMaster.i_empid = User.id)
        where ${condition} 
        GROUP BY User.id 
        ORDER BY concat(User.first_name,' ' ,User.last_name) asc`;
        // console.log(query);
        return db.query(query, callback);       
    }
};
module.exports = Employee;