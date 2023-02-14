const UserMain = require('../models/userschema');
require("dotenv").config(), require("../config/connection");
const Path = require("path");
const { request } = require("express");
require("dotenv").config();
console.log('In The logvalidation')
const userVarify = async(req,res,next)=>{
    try {
        if (req.session.usersxn) {
            let user ;
             UserMain.findOne({ email: req.session.usersxn })
            .then((result)=>{
                console.log(result.delete)
                if (result.delete == true) {
                    res.render("user/user-login", {
                      title: "Login Page",
                      error: "you are blocked.Please contact admin",
                    });
                  } else {
                next()
                  }
            })
            

        }else{
res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
    }
}

const adminVarify = (req,res,next)=>{
    try {
        
            if (req.session.admin) {
                next()
            }else{
                res.render('admin/admin-home.ejs', { title: "admin-home" })
            }
    } catch (error) {
        console.log(error)
        
    }
}

const userOut = (req,res,next)=>{
    try {
        req.session.usersxn = false
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}

const AdminOut = (req,res) =>{
    try {
        req.session.Admin=false
        res.redirect('/admin',)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
 userVarify,adminVarify,userOut,AdminOut}