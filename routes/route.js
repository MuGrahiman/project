const controler = require('../controllers/user/controler')
const controler_admin =require('../controllers/admin/controler') 
const LogVal = require('../utilities/LogVal')
const express = require('express');
const multer = require('multer')
const cloudinary = require ('../config/cloudinary')
const upload = require('../config/multer')
const { add } = require('lodash');
const { memoryStorage } = require('multer');
require('dotenv').config()
const router = express.Router();
//----------------USER---------------
  //  -----------home------------------  
router.get('/',controler.home)
  //  -----------login------------------
router.get('/login',controler.login)
router.post('/login',controler.post_login)
router.get('/user-out',LogVal.userOut)

  //  -----------forgot------------------  
 
router.get('/forgot',controler.forgot)
router.post("/forgot",controler.forgot_post)
router.get("/forgot-otp",controler.forgot_otp)
router.post("/forgot-otp",controler.forgot_otpost)
router.get("/forgot-password",controler.forgot_password)
router.post("/forgot-password",controler.forgotpost_password)
router.get('/foresend',controler.foresend)

  //----------signup----------------
router.get('/sign-up',controler.signUp)
router.post('/sign-up',controler.post_signup)
router.get('/signresend',controler.signresend)
router.post('/otp',controler.OTP_signVarification)

//----------------product-----------------------

router.get('/product',LogVal.userVarify,controler.product)
router.get('/product/:id',LogVal.userVarify,controler.single_product)
// ---------------coupen check----------------
router.put('/coupen_data',LogVal.userVarify,controler.coupen_check)
// -------------------pay pal-------------
router.post('/paypal/:id',LogVal.userVarify,controler.pay)
router.get('/success',LogVal.userVarify,controler.getSuccess)
router.get('/cancel',LogVal.userVarify,controler.getCancel)

// -------------sort and filter------------------
router.get('/pc',LogVal.userVarify,controler.pc)
router.get('/vr',LogVal.userVarify,controler.vr)
router.get('/ps',LogVal.userVarify,controler.ps)
router.get("/less",LogVal.userVarify,controler.less) 
router.get("/more",LogVal.userVarify,controler.more) 
router.get('/subcate/:id',LogVal.userVarify,controler.subcate)
router.get("/data",LogVal.userVarify,controler.Data) 
  
// --------------------search---------------
router.get('/search',LogVal.userVarify,controler.search)  
router.post('/search',LogVal.userVarify,controler.searchpost)  
// --------------profile--------------------
router.get('/profile',LogVal.userVarify,controler.profile)
router.post('/profile',LogVal.userVarify,controler.post_profile)
router.get('/download',LogVal.userVarify,controler.download)
// ------------------user name update---------------
router.patch('/username',LogVal.userVarify,controler.userName)
// --------------------------404-----------------
router.get('/404',controler.erro_404)
// --------------------------500-------------------
router.get('/500',controler.erro_500)


//----------------ADMIN------------------ 
router.get('/admin',LogVal.adminVarify,controler_admin.home)
router.post('/admin',controler_admin.login_admin)
router.get('/admin-out',LogVal.AdminOut)
// ------------------dashboard-----------
router.get('/dashboard',LogVal.adminVarify,controler_admin.dashboard)
// ------------------------purchase------------
router.get('/purchase',LogVal.adminVarify,controler_admin.purchase)

//--------------customer-----------------
router.get('/admin-customer',LogVal.adminVarify,controler_admin.customer)
router.get('/userblock/:id',LogVal.adminVarify,controler_admin.customer_block)
router.get('/userunblock/:id',LogVal.adminVarify,controler_admin.customer_unblock)
//----------------coupen-----------------------
router.get("/coupen",LogVal.adminVarify,controler_admin.coupen)
router.post('/add-coupen',LogVal.adminVarify,controler_admin.add_coupen)
router.post ("/coupen-update/:id",LogVal.adminVarify,controler_admin.coupen_update) 
router.get("/coupen-block/:id",LogVal.adminVarify,controler_admin.coupen_block) 
router.get("/coupen-unblock/:id",LogVal.adminVarify,controler_admin.coupen_unblock) 
//----------------category-----------------------
router.get("/category",LogVal.adminVarify,controler_admin.category) 
router.post('/add-category',LogVal.adminVarify,controler_admin.add_category)
router.post ("/category-update/:id",LogVal.adminVarify,controler_admin.category_update) 
router.get("/category-block/:id",LogVal.adminVarify,controler_admin.category_block) 
router.get("/category-unblock/:id",LogVal.adminVarify,controler_admin.category_unblock) 

//----------------product-----------------------
router.get('/admin-product',LogVal.adminVarify,controler_admin.product)
router.get('/admin-product/:id',LogVal.adminVarify,controler_admin.singleadmin_product)
router.get('/admin-product-add',LogVal.adminVarify,controler_admin.product_add)
router.post('/admin-product-add',LogVal.adminVarify,upload.any(),controler_admin.product_post)
router.get('/admin-product-edit/:id',LogVal.adminVarify,controler_admin.Editadmin_product)
router.post('/admin-product-edit/:id',LogVal.adminVarify,upload.any(),controler_admin.update_product)
router.get("/product-block/:id",LogVal.adminVarify,controler_admin.product_block) 
router.get("/product-unblock/:id",LogVal.adminVarify,controler_admin.product_unblock) 


module.exports=router;          