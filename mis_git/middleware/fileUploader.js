/***********MULTIPART/FORM-DATA FILE UPLOAD SETTINGS STARTS*******/
var multer = require('multer');
const UPLOAD_PATH = 'public/tmp/';
let imageFilter = function (req, file, callback) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        //return callback(new Error('Only image files are allowed!'));
        file.error = true;
        file.errorMessage = 'Only image files are allowed!';
        callback(null, true);
    }
    callback(null, true);
}
let storage = multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: function (req, file, callback) {
        console.log(file);
        let extArray = file.mimetype.split("/");
        let fileNameArr = file.originalname.split(".");
        let fileNameWithoutExt = fileNameArr[0];
        //let extension = extArray[extArray.length - 1];
        let extension = fileNameArr[fileNameArr.length - 1];
        callback(null, fileNameWithoutExt + '_' + Date.now() + '.' + extension)
    }
})
var FileUploader = multer({
    //dest: `${UPLOAD_PATH}/`, 
    //fileFilter: imageFilter,
    storage: storage
}); // multer configuration 
//var uploadProfilePicture = FileUploader.single('pofile_pic');
/***********MULTIPART/FORM-DATA FILE UPLOAD SETTINGS ENDS HERE*******/
module.exports = FileUploader;