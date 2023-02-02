console.log('IN THE MULTER')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require('multer')
const path=require('path');
const sharp = require('sharp')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      // console.log('in the multer')
      // console.log(file)
      if (file.fieldname == 'instalfile') {
        cb(null, path.join(__dirname,'../public/upload/files'));

      } else if (file.fieldname == 'Images') {
        cb(null, path.join(__dirname,'../public/upload/Images'));

      } else if (file.fieldname == 'Image') {
        cb(null, path.join(__dirname,'../public/upload/Image'));

      }
      
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})
// const multerFilter = (req, file, cb) => {
// let result ;
//  sharp(file)
//  .resize({ width: 485, height: 485 })
//  .then(res=>result=res)
//  cb(null,result)
// }
const multerFilter = async(req, file, cb) => {

  let filter = sharp(file).resize({ width: 485, height: 485 })
    // .then(res => cb(null, res))
    cb(null,filter)
}
const upload=multer({storage,fileFilter:multerFilter})


// 
  const cloudstorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "DEV",
        resource_type:"auto"
      },
    });
    // const upload = multer({ storage: cloudstorage});

  module.exports=upload