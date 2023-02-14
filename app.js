const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose')
const path = require('path');
const route = require('./routes/route')
const LogVal = require('../project/utilities/LogVal')
let bodyparser = require("body-parser");
let cookieparser = require("cookie-parser");
const session = require('express-session')
const nodemailer = require('nodemailer')
const cloudinary = require ('./config/cloudinary')
const paypal = require ('./config/paypal')
  require('dotenv').config()
require("./config/connection")
const multer = require("multer");
const { log } = require('console');

const app = express();

const dburi  = 'mongodb://localhost:27017/project'  
mongoose.set("strictQuery", false);

const pdburi  = 'mongodb://localhost:27017/product'  
mongoose.set("strictQuery", false);

// -------------------------View Engine Setup------------------------
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
      key: "usersid",
      secret: "this is the id",
      resave: false,
      saveUninitialized: true, 
    })
  );


//------------path-define------------
app.use("/public", express.static(path.join(__dirname, "public")));
  app.set(morgan('dev'))
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  }); 
  app.set('views', path.join(__dirname, 'views'));
//----------user-page-----------
 app.use(route)

 app.use("*",(req, res) => {
  res.status(500).render("500", { title: "error",});
});
const port = process.env.PORT
app.listen(port,()=>{
  console.log(`server is running at http://localhost:${port}`);
})   