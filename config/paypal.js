console.log('In The Pay pal')
const paypal = require('paypal-rest-sdk');
require('dotenv').config()
require("./connection")

paypal.configure({
    mode: 'sandbox', 
    client_id:  process.env.client_id,
    client_secret: process.env.client_secret
  });
module.exports = paypal ;


