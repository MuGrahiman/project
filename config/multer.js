console.log('IN THE MULTER')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require('multer')
const path=require('path');
const sharp = require('sharp')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
   
      if (file.fieldname == 'file') {
        cb(null, path.join(__dirname,'../public/upload/files'));

      } else if (file.fieldname == 'imgs') {
        cb(null, path.join(__dirname,'../public/upload/Images'));

      } else if (file.fieldname == 'img') {
        cb(null, path.join(__dirname,'../public/upload/Image'));
 
      }
      
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})

const multerFilter = async(req, file, cb) => {

  let filter = sharp(file).resize({ width: 485, height: 485 })
    cb(null,filter)
}
const upload=multer({storage,
  fileFilter:multerFilter
})

  const cloudstorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "DEV",
        resource_type:"auto"
      },
    });
  module.exports=upload