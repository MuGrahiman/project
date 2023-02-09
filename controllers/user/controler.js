const Project = require("../../models/userschema");
const UserMain = require("../../models/userschema");
const Product = require("../../models/productschema");
const Category = require("../../models/categoryschema");
const Order = require("../../models/orderschema");
const bcrypt = require("bcrypt");
const mail_sender = require("../../config/mail_generator");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { request } = require("express");
require("dotenv").config();
const { findOneAndUpdate } = require("../../models/userschema");
const { result, isNull } = require("lodash");
const Coupen = require("../../models/coupen");
const PAYPAL = require("../../config/mail_generator");
const paypal = require("paypal-rest-sdk");

const home = (req, res) => {
  let category;
  Category.find().then((result) => {
    category = result;
  });

  Product.find({delete:false})
    .sort({ createdAt: -1 })
    .then((result) => {
      console.log(result);
      console.log("get all Product to home");
      console.log(req.session.usersxn);
      let session = false;
      if (req.session.usersxn) {
        session = true;
      }
      console.log(session);
      res.render("user/home", {
        title: "Home Page",
        product: result,
        category,
        session,
      });
    });
  // res.render("user/home", { title: "Home Page" });
};
//  -----------login------------------
const login = (req, res) => {
  let category;
  Category.find().then((result) => {
    category = result;
  });
  console.log(category);
  res.render("user/user-login", { title: "Login Page", category: category });
};
const post_login = async (req, res) => {
  const usermail = req.body.email;
  const userpswd = req.body.password;

  try {
    const user = await UserMain.findOne({ email: usermail });
    const password = await bcrypt.compare(userpswd, user.password);
    console.log(user + "" + password);

    if (user) {
      if (password) {
        if (user.delete === true) {
          res.render("user/user-login", {
            title: "Login Page",
            error: "you are blocked.Please contact admin",
          });
        } else {
          req.session.usersxn = user.email;
          console.log("user session created" + req.session.usersxn);
          console.log("posted login form" + JSON.stringify(req.body));
          res.redirect("/");
        }
      } else {
        res.render("user/user-login", {
          title: "Login Page",
          error: "Invalid Password",
        });
      }
    } else {
      res.render("user/user-login", {
        error: "Invalid Email",
        title: "Login Page",
      });
    }
  } catch (error) {
    res.render("user/user-login", {
      error: "Invalid Email",
      title: "Login Page",
    });
    console.log(error);
  }
};

const forgot = (req, res) => {
  res.render("user/forgot", { title: "forgot Page" });
};
let forgoterEmail;
let fOTP;
const forgot_post = async (req, res) => {
  try {
    // const body = req.body;
    const emailId = req.body.email;
    forgoterEmail = await UserMain.findOne({ email: emailId });
    console.log(forgoterEmail);
    if (forgoterEmail) {
      mail_sender
        .mail_sending(forgoterEmail)
        .then((result) => {
          fOTP = result;
          console.log(fOTP + " forgot session otp  ");
          res.redirect("/forgot-otp");
          setTimeout(() => {
            fOTP = false;
            console.log(fOTP + " forgot session otp  deleted");
          }, 60000);
        })
        .catch((error) => {
          console.log("forgot mail sending error " + error);
        });
    } else {
      res.render("user/forgot", {
        title: "forgot Page",
        messege: "Entered Email Is Not Found",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const foresend = async (req, res) => {
  try {
    mail_sender
      .mail_sending(forgoterEmail)
      .then((result) => {
        fOTP = result;
        console.log(fOTP + "session otp for foresend created");
        setTimeout(() => {
          fOTP = false;
          console.log(" forgot resend session otp deleted");
        }, 60000);

        res.redirect("/forgot-otp");
      })
      .catch((error) => {
        console.log(" resend mail sending error " + error);
        res.render("user/forgot", {
          title: "forgot Page",
          messege: "Entered Email Is Not Found",
        });
      });
  } catch (error) {
    console.log(error);
  }
};
const forgot_otp = (req, res) => {
  res.render("user/otp", { title: "Sign-Up Page", success: "you win" });
};
const forgot_otpost = (req, res) => {
  console.log(req.body.Otp + " forgot user otp");
  console.log(fOTP + " forgot user session");

  if (fOTP === req.body.Otp * 1) {
    res.redirect("/forgot-password");
  } else {
    res.render("user/otp", {
      title: "otp-page",
      error: "Entered OTP Is Not Matching",
    });
  }
};

const forgot_password = (req, res) => {
  res.render("user/password", { title: "Sign-Up Page" });
};
const forgotpost_password = async (req, res) => {
  try {
    await UserMain.findOneAndUpdate(
      { email: forgoterEmail },
      { $set: { password: req.body.password } }
    );
    console.log("password changed");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

//----------signup----------------
const signUp = (req, res) => {
  res.render("user/user-sign", { title: "Sign-Up Page" });
};
let signerEmail;
let project;
let sOTP;
const post_signup = async (req, res) => {
  signerEmail = req.body;
  const usermail = req.body.email;
  user = await UserMain.findOne({ email: usermail });
  console.log(signerEmail);
  try {
    if (user) {
      res.render("user/user-sign", {
        title: "Sign-Up Page",
        error: "mail already exist",
      });
    } else {
      if (req.body.Cpassword === req.body.password) {
        mail_sender
          .mail_sending(signerEmail)
          .then(async (result) => {
            const saltround = 8;
            const hashedpswd = await bcrypt.hash(req.body.password, saltround);
            project = new UserMain({
              name: req.body.name,
              email: req.body.email,
              password: hashedpswd,
              delete: false,
            });
            sOTP = result;
            console.log(sOTP + "session otp for sign created");
            setTimeout(() => {
              sOTP = false;
              console.log(sOTP + " sign session otp deleted");
            }, 60000);

            res.render("user/user-sign", {
              title: "OTP Page",
              messege: "Enter The OTP Send To Your Email",
            });
          })
          .catch((error) => {
            console.log(error + "error of sign ");
          });
      } else {
        res.render("user/user-sign", {
          title: "Sign-Up Page",
          error: "password not matching",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const signresend = async (req, res) => {
  try {
    console.log(signerEmail + " signresend");
    mail_sender
      .mail_sending(signerEmail)
      .then((result) => {
        sOTP = result;
        console.log(sOTP + " otp for sign resend");
        setTimeout(() => {
          sOTP = false;
          console.log(" sign resend session otp deleted");
        }, 60000);
        res.render("user/user-sign", {
          title: "OTP Page",
          messege: "Enter The OTP Send To Your Email",
        });
      })
      .catch((error) => {
        console.log(" resend mail sending error " + error);
        res.render("user/user-sign", {
          title: "forgot Page",
          messege: "Entered Email Is Not Found",
        });
      });
  } catch (error) {
    console.log(error);
  }
};
//------------OTP varification--------------

const OTP_signVarification = async (req, res) => {
  console.log(sOTP);
  console.log(req.body.otp + " input");
  if (sOTP === req.body.otp * 1) {
    console.log("signVarification otp varified");
    await project
      .save()
      .then((result) => {
        res.render("user/user-sign", {
          title: "OTP Page",
          success: "OTP varified",
        });
      })
      .catch(function (err) {
        console.log("error: ", err);
      });
  } else {
    res.render("user/user-sign", {
      title: "OTP Page",
      messege: "Enter The OTP Send To Your Email",
      error: "Entered otp is not match",
    });
    console.log("signVarification otp not varified");
  }
};
const product = (req, res) => {
  let category;
  Category.find().then((result) => {
    category = result;
  });
  Product.find({delete:false})
    .sort({ createdAt: -1 })
    .then((result) => {
      console.log("get all Product into product");

      // req.session.sort = false;
      // req.session.filter = false;
      res.render("user/user-product", {
        title: "user-Product",
        product: result,
        category,
      });
    });
};

const single_product = async (req, res) => {
  try {
    let category;
    let id = req.params.id;
    Category.find().then((result) => {
      category = result;
    });

    let others = await Product.find();
    // await Project.find( { product : { $in: [id] } })
    // let eg  = await Product.find( {_id:id})
    let eg = await Project.findOne({ email: req.session.usersxn });

    console.log(eg.products.includes(id) + "this is the product ");

    Product.findById(id)
      .sort({ createdAt: -1 })
      .then((result) => {
        let buyer = eg.products.includes(id);
        res.render("user/user-single-product", {
          title: "user-Product",
          product: result,
          category,
          others,
          buyer,
        });
      });
  } catch (error) {
    console.log(error);
  }
};
// ------------- category-----------------
const pc = async (req, res) => {
  console.log(" in the pc code  c" + req.query.arr);

  let category_product = await Product.find({ category: "pc" });

  if (!req.query.arr) {
    req.session.product = category_product;
    console.log('in the ordinary product') 

    res.redirect('/data');
  } else {

  const arra = JSON.parse(req.query.arr);
    let filtered_product = await Product.find({ 
      _id: { $in: arra },
      category: "pc", 
    });
    console.log(filtered_product.length)
    if (filtered_product.length<=0) {
      
     
      req.session.product = category_product;
  console.log('in the ordinary filtered product')
  
      res.json({ success: true });
    } else {
      req.session.product = filtered_product; 
      req.session.category = true;
      console.log('in the filtered product filter ')
  
      res.json({ success: true });
    }
  }
 
  // if (req.session.category == true) {
  //   req.session.product = category_product;

  //   res.json({ success: true });
  // } else {
  //   req.session.product = filtered_product;  
  //   req.session.category = true;

  //   res.json({ success: true });
  // }
  
};
const vr = async (req, res) => {
  console.log(" in the vr code  c" + req.body);
  let category_product = await Product.find({ category: "vr" });

  if (!req.query.arr) {
    req.session.product = category_product;
    console.log('in the ordinary product') 

    res.redirect('/data');
  } else {

  const arra = JSON.parse(req.query.arr);
    let filtered_product = await Product.find({ 
      _id: { $in: arra },
      category: "vr", 
    });
    console.log(filtered_product.length)
    if (filtered_product.length<=0) {
      
     
      req.session.product = category_product;
  console.log('in the ordinary filtered product')
  
      res.json({ success: true });
    } else {
      req.session.product = filtered_product; 
      req.session.category = true;
      console.log('in the filtered product filter ')
  
      res.json({ success: true });
    }
  }
 
  // if (req.session.category == true) {
  //   req.session.product = category_product;

  //   res.json({ success: true });
  // } else {
  //   req.session.product = filtered_product;
  //   req.session.category = true;

  //   res.json({ success: true });
  // }


};
const ps = async (req, res) => {
  console.log(" in the ps code  c" + req.body);
  let category_product = await Product.find({ category: "ps" });

  if (!req.query.arr) {
    req.session.product = category_product;
    console.log('in the ordinary product') 

    res.redirect('/data');
  } else {

  const arra = JSON.parse(req.query.arr);
    let filtered_product = await Product.find({ 
      _id: { $in: arra },
      category: "ps", 
    });
    console.log(filtered_product.length)
    if (filtered_product.length<=0) {
      
     
      req.session.product = category_product;
  console.log('in the ordinary filtered product')
  
      res.json({ success: true });
    } else {
      req.session.product = filtered_product; 
      req.session.category = true;
      console.log('in the filtered product filter ')
  
      res.json({ success: true });
    }
  }
  // if (req.session.category == true) {
  //   req.session.product = category_product;

  //   res.json({ success: true });
  // } else {
  //   req.session.product = filtered_product;
  //   req.session.category = true;

  //   res.json({ success: true });
  // }


};
// ---------------sort---------
const more = async (req, res) => {
  console.log(" in the more code  c" + req.body);
  const arra = JSON.parse(req.query.arr);
  console.log(arra);

  await Product.find({ _id: { $in: arra } })
    .sort({ cost: -1 })
    .then((result) => {
      console.log(result.map((p) => p.cost));
      req.session.product = result;

      res.json({ success: true });
    })
    .catch((err) => console.log(err));
};
const less = async (req, res) => {
  console.log(" in the less code  c" + req.body);
  const arra = JSON.parse(req.query.arr);
  console.log(arra);

  await Product.find({ _id: { $in: arra } })
    .sort({ cost: 1 })
    .then((result) => {
      console.log(result.map((p) => p.cost));
      req.session.product = result;

      res.json({ success: true });
    })
    .catch((err) => console.log(err));

};
//-----------------sub category----------------
const subcate = async (req, res) => {
  try {
    console.log(" in the subcategory code  c" + req.params.id);
  // let category_product = await Product.find({ category: "ps" });
  // const arra = JSON.parse(req.query.arr);
    const id = req.params.id;
    let genres = await Category.findById(id);
    let category_product =
    await Product.find({ genres:genres.title })
    .then((result)=>console.log(result))
  console.log(genres.title);
  // console.log(category_product);

    if (!req.query.arr) {
      req.session.product = category_product;
      console.log('in the ordinary product') 
  
      res.redirect('/data');
    } else {
  
    const arra = JSON.parse(req.query.arr);
    let filtered_product = await Product.find({
      _id: { $in: arra },
      genres: genres.title,
    });
      // console.log(filtered_product.length)
      if (filtered_product.length<=0) {
        
       
        req.session.product = category_product;
        // console.log(req.session.product);
    console.log('in the ordinary filtered product')
    
        res.json({ success: true });
      } else {
        req.session.product = filtered_product; 
        req.session.category = true;
        console.log('in the filtered product filter ')
    
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
// ------------search---------------
const search = async (req, res) => {
  try {
    Product.find(
      {
        $or: [
          { title: { $regex: req.query.search } },
          { category: { $regex: req.query.search } },
          { genres: { $regex: req.query.search } },
        ],
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let category;

          Category.find().then((result) => {
            category = result;
          });
          Product.find({})
            .sort({ createdAt: -1 })
            .then((result) => {
              console.log(result);
              console.log("get all Product into search");
              res.render("user/user-product", {
                title: "user-Product",
                product: result,
                category,
                data,
              });
            });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const searchpost = async (req, res) => {
  let category;

  Category.find().then((result) => {
    category = result;
  });
  Product.find({
    $or: [
      { title:  { $regex: new RegExp(req.body.search, "i") } },
      { category:  { $regex: new RegExp(req.body.search, "i") } },
      { genres:  { $regex: new RegExp(req.body.search, "i") } },
    ],
  })
    .sort({ createdAt: -1 })
    .then((result) => {
      console.log(result);
      console.log("get all Product into search");
      res.render("user/user-product", {
        title: "user-Product",
        product: result,
        category,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
const coupen_check = async (req, res) => {
  const id = req.body.id;
  const value = req.body.valu;

  let product;
  await Product.find({ _id: id }).then((res) => (product = res));

  let coup = await Coupen.findOne({ code: value });

  if (coup) {
    if (coup.expiry <= Date.now()) {
      let dateEx = "Coupon Expired ";
      res.json({ dateEx });
    } else {
      let float = false;
      // coup.user.forEach((element) => {
      for (let i = 0; i < coup.user.length; i++) {
        const element = coup.user[i];
        if (element == req.session.usersxn) {
          float = true;
          break;
        }
      }

      // });
      console.log(float);
      if (float == true) {
        let UserEx = "you already used this coupen";
        res.json({ UserEx });
      } else {
        Coupen.findOneAndUpdate(
          { code: value },
          { $push: { user: req.session.usersxn } }
        ).then((res) => console.log(res));
        req.session.coupen = coup.id;
        const userSxs = coup.discount;
        res.json({ userSxs });
      }
    }
  } else {
    let NotFound = "Not Found any Coupen ";
    console.log(NotFound);
    res.json({ NotFound });
  }
  
};
// -------------------------------pay pal-------------
const pay = (req, res) => {
  console.log(req.body.cost + " " + req.params.id);
  req.session.cost = req.body.cost;
  req.session.payedproduct = req.params.id;
  const cost = req.session.cost;
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      // return_url: `${process.env.PAYPALink}/success`,
      // cancel_url:`${process.env.PAYPALink}/cancel`,
      return_url: `http://playtform.online/success`,
      cancel_url: `http://playtform.online/cancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: cost,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: cost,
        },
        description: "Hat for the best team ever",
      },
    ],
  };
  console.log(create_payment_json);
  paypal.payment.create(create_payment_json, function (error, payment) {
    console.log(error + "error payment" + payment);
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          console.log(payment.links[i].rel + "approval_url");
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
};

const getSuccess = async (req, res) => {
  console.log("get success page");
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const cost = req.session.cost;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: cost,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
        return false;
      } else {
        let category;
        let id = mongoose.Types.ObjectId(req.session.payedproduct);
        console.log(id);

        Project.findOneAndUpdate(
          { email: req.session.usersxn },
          { $push: { products: req.session.payedproduct } }
        )
          .then((result) => {
            console.log(result.id);
            let order = new Order({
              user: result.id,
              product :req.session.payedproduct,
              coupen:req.session.coupen,
              finalAmount:cost
            });
            order.save().then((result)=>{
              console.log(res)
            res.redirect("/product/" + id);

            })
          })

          .catch((err) => console.log(err));
      }
    }
  );
};
const getCancel = async (req, res) => {
  console.log("in the cancel page");
  try {
    let category;
    let id = req.session.product;
    Category.find().then((result) => {
      category = result;
    });
    let others;
    Product.find().then((res) => (others = res));
    Product.findById(id)
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("user/user-single-product", {
          title: "user-Product",
          product: result,
          category,
          others,
        });
      });
  } catch (error) {
    console.log(error);
  }
  // res.send("Cancelled");
};
const Data = async (req, res) => {
  let category;
  Category.find().then((result) => {
    category = result;
  });
  Product.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      console.log("get all Product into data");

      if (req.session.product) {
        // console.log(req.session.product);

        let product = req.session.product;
        req.session.product = false;
        res.render("user/user-product", {
          title: "user-Product",
          product,
          category,
        });
      } else {
        res.render("user/user-product", {
          title: "user-Product",
          product: result,
          category,
        });
      }
    });
};
const profile = async (req, res) => {
  let category;
  console.log(req.session.usersxn);
  await Project.findOne({ email: req.session.usersxn }).then((result) => {
    console.log(result);
    res.render("user/profile", {
      title: "profile Page",
      profile: result,
    });
  });
};
const post_profile = async (req, res) => {
  // const username = req.body.username;
  const currentpass = req.body.currentpass;
  const newpass = req.body.newpass;
  console.log(newpass, currentpass);
  const user = await UserMain.findOne({ email: req.session.usersxn });
  const password = await bcrypt.compare(currentpass, user.password);
  console.log(user + "" + password);
  if (password) {
    if (currentpass == newpass) {
      res.json({ changepass: "Please Change Your Password" });
    } else {
      const saltround = 8;
      const newpassword = await bcrypt.hash(newpass, saltround);

      await UserMain.findOneAndUpdate(
        { email: req.session.usersxn },
        {
          password: newpassword,
        }
      );
      res.json({ finish: "Your Password Is Not Matching" });
    }
  } else {
    res.json({ pass: "Your Password Is Not Matching" });
  }
};
const download = async (req, res) => {
  // let ids;
  // Project.find({ email: req.session.usersxn }).then(
  //   (result) => (ids = result.product)
  // );
  await Project.findOne({ email: req.session.usersxn })
    .populate("products")
    .exec()
    .then((user) => {
      console.log(user.products + "user poopulaataer");
      if (user) {
        let product = user.products;
        console.log(product);

        res.render("user/downloads", {
          title: "profile Page",
          data: product,
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
  // const data = await Product.find({
  //   _id: {
  //     $in: ids,
  //   },
  // });

  // Category.find().then((result) => {

  // });
};
const userName = (req,res)=>{
  console.log('in the patch route'+req.body.username)
  Project.findOneAndUpdate({
    email: req.session.usersxn
  }, {
    $set: {
      name: req.body.username 
    }
  }).then((result) => {
    console.log(result)
    res.json({
      success: "success"
    })
  }).catch((error)=>{
    console.log(error)
    res.json({failed:"failed"})
  })
}
//-------------export-items-------------

module.exports = {
  Data,
  home,
  login,
  post_login,
  post_signup,
  signUp,
  signresend,
  OTP_signVarification,
  forgot,
  forgot_post,
  forgot_otp,
  foresend,
  forgot_otpost,
  forgot_password,
  forgotpost_password,
  product,
  single_product,
  ps,
  pc,
  vr,
  more,
  less,
  subcate,
  search,
  searchpost,
  coupen_check,
  pay,
  getCancel,
  getSuccess,
  profile,
  download,
  post_profile,
  userName
};
