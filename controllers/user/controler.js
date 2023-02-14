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

const home = async(req, res) => {
  try {
    let category = await Category.find();

// console.log(category)
    Product.find({ delete: false })
      .sort({ createdAt: -1 })
      .then((result) => {
        let session = false;
        if (req.session.usersxn) {
          session = true;
        }
        res.render("user/home", {
          title: "Home Page",
          product: result,
          category,
          session,
        });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
//  -----------login------------------
const login = (req, res) => {
  try {
    let category;
    Category.find().then((result) => {
      category = result;
    });
    res.render("user/user-login", { title: "Login Page", category: category });
  } catch (error) {
    res.redirect("/404");
  }
};
const post_login = async (req, res) => {
  const usermail = req.body.email;
  const userpswd = req.body.password;

  try {
    const user = await UserMain.findOne({ email: usermail });
    const password = await bcrypt.compare(userpswd, user.password);

    if (user) {
      if (password) {
        if (user.delete == true) {
          res.render("user/user-login", {
            title: "Login Page",
            error: "you are blocked.Please contact admin",
          });
        } else {
          req.session.usersxn = user.email;
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
    res.redirect("/404");
  }
};

const forgot = (req, res) => {
  res.render("user/forgot", { title: "forgot Page" });
};
let forgoterEmail;
let fOTP;
const forgot_post = async (req, res) => {
  try {
    const emailId = req.body.email;
    forgoterEmail = await UserMain.findOne({ email: emailId });
    if (forgoterEmail) {
      mail_sender.mail_sending(forgoterEmail).then((result) => {
        fOTP = result;
        res.redirect("/forgot-otp");
        setTimeout(() => {
          fOTP = false;
        }, 60000);
      });
    } else {
      res.render("user/forgot", {
        title: "forgot Page",
        messege: "Entered Email Is Not Found",
      });
    }
  } catch (error) {
    res.redirect("/404");
  }
};
const foresend = async (req, res) => {
  try {
    mail_sender
      .mail_sending(forgoterEmail)
      .then((result) => {
        fOTP = result;
        setTimeout(() => {
          fOTP = false;
        }, 60000);

        res.redirect("/forgot-otp");
      })
      .catch((error) => {
        res.render("user/forgot", {
          title: "forgot Page",
          messege: "Entered Email Is Not Found",
        });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
const forgot_otp = (req, res) => {
  res.render("user/otp", { title: "Sign-Up Page", success: "you win" });
};
const forgot_otpost = (req, res) => {
  try {
    if (fOTP === req.body.Otp * 1) {
      res.redirect("/forgot-password");
    } else {
      res.render("user/otp", {
        title: "otp-page",
        error: "Entered OTP Is Not Matching",
      });
    }
  } catch (error) {
    res.redirect("/404");
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
    res.redirect("/login");
  } catch (error) {
    res.redirect("/404");
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
  try {
    if (user) {
      res.render("user/user-sign", {
        title: "Sign-Up Page",
        error: "mail already exist",
      });
    } else {
      if (req.body.Cpassword === req.body.password) {
        mail_sender.mail_sending(signerEmail).then(async (result) => {
          const saltround = 8;
          const hashedpswd = await bcrypt.hash(req.body.password, saltround);
          project = new UserMain({
            name: req.body.name,
            email: req.body.email,
            password: hashedpswd,
            delete: false,
          });
          sOTP = result;
          setTimeout(() => {
            sOTP = false;
          }, 60000);

          res.render("user/user-sign", {
            title: "OTP Page",
            messege: "Enter The OTP Send To Your Email",
          });
        });
      } else {
        res.render("user/user-sign", {
          title: "Sign-Up Page",
          error: "password not matching",
        });
      }
    }
  } catch (error) {
    res.redirect("/404");
  }
};
const signresend = async (req, res) => {
  try {
    mail_sender
      .mail_sending(signerEmail)
      .then((result) => {
        sOTP = result;
        setTimeout(() => {
          sOTP = false;
        }, 60000);
        res.render("user/user-sign", {
          title: "OTP Page",
          messege: "Enter The OTP Send To Your Email",
        });
      })
      .catch((error) => {
        res.render("user/user-sign", {
          title: "forgot Page",
          messege: "Entered Email Is Not Found",
        });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
//------------OTP varification--------------

const OTP_signVarification = async (req, res) => {
  try {
    if (sOTP === req.body.otp * 1) {
      await project.save().then((result) => {
        res.render("user/user-sign", {
          title: "OTP Page",
          success: "OTP varified",
        });
      });
    } else {
      res.render("user/user-sign", {
        title: "OTP Page",
        messege: "Enter The OTP Send To Your Email",
        error: "Entered otp is not match",
      });
    }
  } catch (error) {
    res.redirect("/404");
  }
};
const product = async (req, res) => {
  try {
    let category = await Category.find();

    Product.find({ delete: false })
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("user/user-product", {
          title: "user-Product",
          product: result,
          category,
        });
      });
  } catch (error) {
    res.redirect("/404");
  }
};

const single_product = async (req, res) => {
  try {
    let id = req.params.id;
    let category = await Category.find();

    let others = await Product.find();
    let eg = await Project.findOne({ email: req.session.usersxn });

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
    res.redirect("/404");
  }
};
// ------------- category-----------------
const pc = async (req, res) => {
  try {
    let category_product = await Product.find({ category: "pc" });

    if (!req.query.arr) {
      req.session.product = category_product;

      res.redirect("/data");
    } else {
      const arra = JSON.parse(req.query.arr);
      let filtered_product = await Product.find({
        _id: { $in: arra },
        category: "pc",
      });
      if (filtered_product.length <= 0) {
        req.session.product = category_product;

        res.json({ success: true });
      } else {
        req.session.product = filtered_product;
        req.session.category = true;

        res.json({ success: true });
      }
    }
  } catch (error) {
    res.redirect("/404");
  }
};
const vr = async (req, res) => {
  try {
    let category_product = await Product.find({ category: "vr" });

    if (!req.query.arr) {
      req.session.product = category_product;

      res.redirect("/data");
    } else {
      const arra = JSON.parse(req.query.arr);
      let filtered_product = await Product.find({
        _id: { $in: arra },
        category: "vr",
      });
      if (filtered_product.length <= 0) {
        req.session.product = category_product;

        res.json({ success: true });
      } else {
        req.session.product = filtered_product;
        req.session.category = true;

        res.json({ success: true });
      }
    }
  } catch (error) {
    res.redirect("/404");
  }
};
const ps = async (req, res) => {
  try {
    let category_product = await Product.find({ category: "ps" });

    if (!req.query.arr) {
      req.session.product = category_product;

      res.redirect("/data");
    } else {
      const arra = JSON.parse(req.query.arr);
      let filtered_product = await Product.find({
        _id: { $in: arra },
        category: "ps",
      });
      if (filtered_product.length <= 0) {
        req.session.product = category_product;

        res.json({ success: true });
      } else {
        req.session.product = filtered_product;
        req.session.category = true;

        res.json({ success: true });
      }
    }
  } catch (error) {
    res.redirect("/404");
  }
};
// ---------------sort---------
const more = async (req, res) => {
  try {
    const arra = JSON.parse(req.query.arr);

    await Product.find({ _id: { $in: arra } })
      .sort({ cost: -1 })
      .then((result) => {
        req.session.product = result;

        res.json({ success: true });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
const less = async (req, res) => {
  try {
    const arra = JSON.parse(req.query.arr);

    await Product.find({ _id: { $in: arra } })
      .sort({ cost: 1 })
      .then((result) => {
        req.session.product = result;

        res.json({ success: true });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
//-----------------sub category----------------
const subcate = async (req, res) => {
  try {
    const id = req.params.id;
    let genres = await Category.findById(id);
    let category_product = await Product.find({ genres: genres.title }).then((result)=>console.log(result));
    if (!req.query.arr) {
      console.log('genres')
      req.session.product = category_product;

      res.redirect("/data");
    } else {
      console.log('genres bfdgfg')

      const arra = JSON.parse(req.query.arr);
      let filtered_product = await Product.find({
        _id: { $in: arra },
        genres: genres.title,
      });
      if (filtered_product.length <= 0) {
        req.session.product = category_product;

        res.json({ success: true });
      } else {
        req.session.product = filtered_product;
        req.session.category = true;

        res.json({ success: true });
      }
    }
  } catch (error) {
    res.redirect("/404");
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
    res.redirect("/404");
  }
};

const searchpost = async (req, res) => {
  try {
    let category = await Category.find();

    Product.find({
      $or: [
        { title: { $regex: new RegExp(req.body.search, "i") } },
        { category: { $regex: new RegExp(req.body.search, "i") } },
        { genres: { $regex: new RegExp(req.body.search, "i") } },
      ],
    })
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("user/user-product", {
          title: "user-Product",
          product: result,
          category,
        });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
const coupen_check = async (req, res) => {
  try {
    const id = req.body.id;
    const value = req.body.valu;

    let product;
    await Product.find({ _id: id }).then((res) => (product = res));

    let coup = await Coupen.findOne({ code: value });

    if (coup) {
      console.log(coup)
      if (coup.expiry <= Date.now()) {
        let dateEx = "Coupon Expired ";
        res.json({ dateEx });
      } else {
     
        let float = coup.user.includes(req.session.usersxn);
        if (float == true) {
          let UserEx = "you already used this coupen";
          res.json({ UserEx });
        } else {
          Coupen.findOneAndUpdate(
            { _id: coup.id },
            { $push: { user: req.session.usersxn } }
          ).then((result)=>{
         
          req.session.coupen = coup.id;
          const userSxs = coup.discount;
          res.json({ userSxs });
        })
        }
      }
    } else {
      let NotFound = "Not Found any Coupen ";
      res.json({ NotFound });
    }
  } catch (error) {
    res.redirect("/404");
  }
};
// -------------------------------pay pal-------------
const pay = (req, res) => {
  try {
    req.session.cost = req.body.cost;
    req.session.payedproduct = req.params.id;
    const cost = req.session.cost;
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://localhost:${process.env.PORT}/success`,
        cancel_url: `http://localhost:${process.env.PORT}/cancel`,
        // return_url: `http://playtform.online/success`,
        // cancel_url: `http://playtform.online/cancel`,
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
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  } catch (error) {
    res.redirect("/404");
  }
};

const getSuccess = async (req, res) => {
  try {
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
          throw error;
          return false;
        } else {
          let category;
          let id = mongoose.Types.ObjectId(req.session.payedproduct);
        
          Project.findOneAndUpdate(
            { email: req.session.usersxn },
            { $push: { products: req.session.payedproduct } }
          ).then((result) => {
            let order = new Order({
              user: result.id,
              product: req.session.payedproduct,
              coupen: req.session.coupen,
              finalAmount: cost,
            });
            order.save().then((result) => {
              res.redirect("/product/" + id);
            });
          });
        }
      }
    );
  } catch (error) {
    res.redirect("/404");
  }
};
const getCancel = async (req, res) => {
  try {
    let id = req.session.product;
    let category = await Category.find();

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
    res.redirect("/404");
  }
};
const Data = async (req, res) => {
  try {
    let category = await Category.find();

    Product.find()
      .sort({ createdAt: -1 })
      .then((result) => {
        if (req.session.product) {
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
  } catch (error) {
    res.redirect("/404");
  }
};
const profile = async (req, res) => {
  try {
    await Project.findOne({ email: req.session.usersxn }).then((result) => {
      res.render("user/profile", {
        title: "profile Page",
        profile: result,
      });
    });
  } catch (error) {
    res.redirect("/404");
  }
};
const post_profile = async (req, res) => {
  try {
    const currentpass = req.body.currentpass;
    const newpass = req.body.newpass;
    const user = await UserMain.findOne({ email: req.session.usersxn });
    const password = await bcrypt.compare(currentpass, user.password);
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
  } catch (error) {
    res.redirect("/404");
  }
};
const download = async (req, res) => {
  try {
    await Project.findOne({ email: req.session.usersxn })
      .populate("products")
      .exec()
      .then((user) => {
        if (user) {
          let product = user.products;

          res.render("user/downloads", {
            title: "profile Page",
            data: product,
          });
        }
      });
  } catch (error) {
    res.redirect("/404");
  }
};
const userName = (req, res) => {
  try {
    Project.findOneAndUpdate(
      {
        email: req.session.usersxn,
      },
      {
        $set: {
          name: req.body.username,
        },
      }
    )
      .then((result) => {
        res.json({
          success: "success",
        });
      })
      .catch((error) => {
        res.json({ failed: "failed" });
      });
  } catch (error) {
    res.redirect("/404");
  }
};
const erro_404 = (req, res) => {
  res.render("404", {
    title: "404 Page",
  });
};
const erro_500 = (req, res) => {
  res.render("500", {
    title: "500 Page",
  });
};
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
  userName,
  erro_404,erro_500
};
