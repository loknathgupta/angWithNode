var db = require('./db');


var res = [];
var UserAccess = {

    getMenu: function (parent_id, callback) {

        return db.query(`select  id, module_name , router,icon from module where parent_id = '${parent_id}' ORDER BY sort_order`, callback);
    },

    getAllChild: function (callback) {

        return db.query(`select  id, module_name , router,parent_id,icon from module where parent_id > 0  ORDER BY sort_order`, callback);
    },
    getUserRole: function (callback) {
        return db.query(`select name, short_name,id from user_role  order by name `, callback);
    },
    getPMenuByRole: function (role_id, userType, callback) {
        if(userType.indexOf("SA") < 0){
        return db.query(`select  distinct Parent.id, Parent.module_name , Parent.router, Parent.icon from module as Child inner join module as Parent on Child.parent_id = Parent.id inner join module_access ModuleAccess on ModuleAccess.module_id = Child.id where ModuleAccess.role_id in (${role_id}) ORDER BY Parent.sort_order`, callback);
        }else{
            console.log(userType);
            UserAccess.getMenu('0',callback);
        }
    },
    getCMenuByRole: function (role_ids, userType, callback) {
        if(userType.indexOf("SA") < 0){
        return db.query(`select  distinct Child.id, Child.module_name , Child.router,Child.parent_id, Child.icon, (select group_concat(router) from module_sub_pages ModuleSubPages where ModuleSubPages.module_id = Child.id or  ModuleSubPages.module_id =0 ) as sub_router from module as Child inner join module_access ModuleAccess on ModuleAccess.module_id = Child.id where ModuleAccess.role_id in (${role_ids}) ORDER BY Child.sort_order`, callback);
        }else{
            console.log(userType);
            UserAccess.getAllChild(callback);
        }
    },
    getAllModuleAccess: function (callback) {
        return db.query(`select role_id, module_id from module_access  `, callback);
    },
    deleteModuleAccess: function (roleId, callback) {
        return db.query(`delete from module_access where role_id in( ${roleId}) `, callback);
    },
    saveModuleAccess: function (roledata, reqData, callback) {
        var deleteArr = [];
        var saveArr = [];
        roledata.forEach(function (element) {
            
                    //console.log(this.sql);
                    
                    deleteArr.push(element.id);
                    if (Array.isArray(reqData[element.short_name])) {
                        reqData[element.short_name].forEach(function (val) {
                            var inserObj = [element.id, val];
                            saveArr.push(inserObj);
                        });
                    } else {
                        if (reqData[element.short_name]) {
                            var inserObj = [element.id, reqData[element.short_name]];
                            saveArr.push(inserObj);
                        }
                    }
                });
                UserAccess.deleteModuleAccess(deleteArr, function (err, result) {
                    if(err){
                        throw err;
                    }else{
                        //console.log(saveArr);
                        if (saveArr.length > 0) {
                            return db.query(`INSERT INTO module_access (role_id, module_id ) VALUES ?`, [saveArr], callback);
                        } else {

                            callback(err, result);
                        }
                    }
                });
      


    }
};
module.exports = UserAccess;