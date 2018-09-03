

var url = require('url');
var express = require('express');
var Auth = {
    isLoggedIn: function (req, res, next) {        
        var q = url.parse(req.url, true);
        if (req.url == '/user/login' || req.url == '/user/forgot-password' || req.url.match(/\/chat/g) ) {
            next();
        } else {
            //console.log(req.session.userData)
            if (req.session.userData !== undefined) {
                var accessUrl = false;
                if(req.session.userData.v_usertype.indexOf("SA") >= 0){
                    accessUrl = true;
                }else{
                // console.log(req._parsedUrl);
                    var path = q.pathname.replace(/^\/|\/$/g, "");
                    console.log(path);
                    slashCount = (path.match(/\//g) || []).length;
                    if(slashCount>1){
                    //console.log(slashCount);
                    var splitWord = path.split('/');
                    var newWord = '';
                    for(var i = 0; i < 2; i++) {
                        if(i != (2 - 1)) {
                            newWord += splitWord[i] + '/';
                        } else {
                            newWord += splitWord[i];
                        }   
                    }
                    path = newWord;
                     // path = path.replace(/\/.*$/,"");
                    }
                    path = path.toLowerCase();
                 console.log(path);
                    //path = path.;
                   
                // console.log(req.session.userData.childMenuAll);
                var newSubpages =[];
                if(req.session.userData.childMenuAll){
                    req.session.userData.childMenuAll.forEach(function(menuRowChild){
                    var subPages = menuRowChild.sub_router.split(",");
                    
                        for(var i = 0; i<subPages.length; i++){
                            let sPage = subPages[i].replace(/^\/|\/$/g, "");
                            sPage = sPage.toLowerCase();
                            newSubpages.push(sPage);
                        }
                    //  console.log(newSubpages);
                        if(menuRowChild.router.replace(/^\/|\/$/g, "") == path ){
                        accessUrl = true; 
                        }
                    });
                   // console.log(path);
                   // console.log(newSubpages.indexOf(path));
                    if( newSubpages.indexOf(path)>=0){
                        accessUrl = true; 
                    }
                }else{
                    accessUrl = true; 
                }
                }
                if(accessUrl){
                 next(); //If session exists, proceed to page
                }else{
                 req.flash('msg', 'You are not authorize to access this url.');
                 res.redirect('/user/profile/');
                }
              //  next();     //If session exists, proceed to page
            } else {    
                let accessedUrl = req.originalUrl.split('/');   
                if(accessedUrl[1] != 'assets')   {      
                    req.session.referedFrom = req.originalUrl;
                }                
                return res.redirect('/user/login')
                //next();  //Error, trying to access unauthorized page! //Here nor need to call next as user has bee redirected to the login page.
            }
        }
    }
}

module.exports = Auth;