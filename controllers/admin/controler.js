const { result, get } = require("lodash");
const Project = require("../../models/userschema");
const Product = require("../../models/productschema");
const Category = require("../../models/categoryschema");
const Coupen = require("../../models/coupen");
const bodyparser = require("body-parser");
const multer = require("multer");
const upload = require("../../config/multer");
const fileUpload = multer();
const Cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");
const url = require("url");
const fs = require("fs");
const { log } = require("console");
require("dotenv").config(), require("../../config/connection");

const Path = require("path");
const sharp = require("sharp");
let adminno = 226688;

const home = (req, res) => {
  res.render("admin/admin-home.ejs", { title: "admin-home" });
};
const login_admin = (req, res) => {
  if (adminno == req.body.password) {
    req.session.admin = true;
    console.log("admin session created");
    res.redirect("/admin-customer");
  } else {
    res.render("admin/admin-home.ejs", {
      title: "admin-home-error",
      error: "password not matching",
    });
  }
};
const customer = (req, res) => {
  Project.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      console.log(result);
      console.log("get all data from db");
      res.render("admin/admin-customer", {
        title: "admin-customer",
        project: result,
      });
    });
};
const customer_block = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for block");

  Project.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/admin-customer");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
const customer_unblock = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for unblock");

  Project.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: false } })
    .then((result) => {
      res.redirect("/admin-customer");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
const product = (req, res) => {
  Product.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      console.log(result);
      console.log("get all Product from db");
      res.render("admin/admin-product", {
        title: "admin-Product",
        product: result,
      });
    });
};

const Editadmin_product = async (req, res) => {
  try {
    let category;
    let id = req.params.id;
    Category.find().then((result) => {
      category = result;
    });
    // let others =await Product.find()
    Product.findById(id)
      .sort({ createdAt: -1 })
      .then((result) => {
        console.log(result);
        console.log("get all singleadmin_product");
        // console.log(others+"other product");
        res.render("admin/admin-edit-product", {
          title: "user-Product",
          product: result,
          category,
          // others
        });
      });
  } catch (error) {
    console.log(error);
  }
};

const product_add = async (req, res) => {
  const category = await Category.find();
  const product = await Product.find();

  res.render("admin/admin-product-add", {
    title: "admin-product-add",
    category,
    product,
  });
};
const singleadmin_product = async (req, res) => {
  try {
    let category;
    let id = req.params.id;
    Category.find().then((result) => {
      category = result;
    });
    let others = await Product.find();
    Product.findById(id)
      .sort({ createdAt: -1 })
      .then((result) => {
        console.log(result);
        console.log("get all Product into product");
        console.log(others + "other product");
        res.render("admin/admin-single-product", {
          title: "user-Product",
          product: result,
          category,
          others,
        });
      });
  } catch (error) {
    console.log(error);
  }
};
const product_post = async (req, res) => {
  try {
    const imgs = [];
    let img;
    let instalfile;
    let Image;
    let Images = [];

    req.files.forEach((file) => {
      //  console.log(file.fieldname)
      if (file.fieldname == "instalfile") {
        instalfile = file;
      } else if (file.fieldname == "Image") {
        Image = file;
      } else if (file.fieldname == "Images") {
        Images.push(file);
      }
    });


    const data = {
      image: Image.path,
    };

    let war = await Cloudinary.uploader.upload(Image.path, {
      public_id: Image.filename,
    });

    for (i = 0; i < Images.length; i++) {
    
      const datas = {
        image: Images[i].path,
      };
      let mar = await Cloudinary.uploader.upload(Images[i].path, {
        public_id: Images[i].filename,
      });

      imgs.push({ public_id: mar.public_id, url: mar.url });
    }
console.log(req.files)
    newproduct = new Product({
      file: req.files[2].filename,
      title: req.body.title,
      developer: req.body.developer,
      release_date: req.body.release,
      category: req.body.category,
      version: req.body.version,
      genres: req.body.genres,
      cost: req.body.cost,
      about: req.body.about,
      imgs: imgs,
      img: { public_id: war.public_id, url: war.url },
    });
    
    let finder = await Product.findOne({ title: req.body.title });
    if (finder) {
      Category.find()
        .sort({ createdAt: -1 })
        .then((result) => {
          res.render("admin/admin-product-add", {
            title: "admin-product-add",
            category: result,
            err: "product already exist",
          });
        });
    } else {
      console.log("new product added");
      await newproduct.save().then((res)=>console.log(res));
      res.redirect("/admin-product-add");
    }
  } catch (err) {
    Category.find()
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("admin/admin-product-add", {
          title: "admin-product-add",
          category: result,
          err,
        });
      });
    console.log(err);
  }
};

const update_product = async (req, res) => {
  try {
    let category;
    let id = req.params.id;

    console.log(id);
    Product.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          title: req.body.name,
          developer: req.body.developer,
          // release_date:Date.now(),
          category: req.body.category,
          genres: req.body.genres,
          cost: req.body.cost,
        },
      },
      console.log(req.body)
    ).then((result) => {
      console.log(result);
      console.log("get all singleadmin_postproduct");
      // console.log(others+"other product");
      // res.render("admin/admin-single-product", {
      //   title: "user-Product",
      //   product: result,
      // category,
      // others
      // });
      res.redirect("/admin-product");
    });
  } catch (error) {
    console.log(error);
  }
};
const product_block = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for unblock");

  Product.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/admin-product");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
const product_unblock = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for unblock");

  Product.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: false } })
    .then((result) => {
      res.redirect("/admin-product");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
//----------------coupen-----------------------
const coupen = (req, res) => {
  let category;
  Category.find().then((res) => (category = res));
  Coupen.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("admin/admin-coupen", {
        title: "admin-category",
        coupen: result,
        category,
      });
    });
  // res.render('admin/admin-coupen')
};
const add_coupen = async (req, res) => {
  const newcoupen = new Coupen({
    title: req.body.title,
    code: req.body.code,
    discount: req.body.discount,
    expiry: req.body.expiry,
    delete: false,
  });
  let finder = await Coupen.findOne({ title: req.body.code });
  if (finder) {
    let category;
    Category.find().then((res) => (category = res));
    Coupen.find()
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("admin/admin-coupen", {
          title: "admin-category",
          coupen: result,
          category,
          err: "coupen code already exist",
        });
      });
  } else {
    await newcoupen
      .save()
      .then((result) => {
        console.log("new copen added" + result);
        res.redirect("/coupen");
      })
      .catch((err) => console.log(err));
  }
};
const coupen_update = (req, res) => {
  let id = req.params.id;
  console.log(id + " this is the id for update " + req.body.title);

  Category.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        title: req.body.title,
        code: req.body.code,
        discount: req.body.discount,
        expiry: req.body.expiry,
        delete: false,
      },
    }
  )
    .then((result) => {
      res.redirect("/coupen");
      console.log("this is update result" + result);
    })
    .catch((err) => console.log("404 " + err));
};
const coupen_block = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for coupen block");

  Coupen.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/coupen");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
const coupen_unblock = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for block");

  Coupen.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: false } })
    .then((result) => {
      res.redirect("/coupen");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
//----------------coupen-----------------------
const category = (req, res) => {
  Category.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("admin/admin-category", {
        title: "admin-category",
        category: result,
      });
    });
};

const add_category = async (req, res) => {
  const newcategory = new Category({
    title: req.body.name,
    delete: false,
  });
  await newcategory
    .save()
    .then((result) => {
      res.redirect("/category");
    })
    .catch((err) => console.log(err));
};
const category_update = (req, res) => {
  let id = req.params.id;
  console.log(id + " this is the id for update " + req.body.title);

  Category.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { title: req.body.title } }
  )
    .then((result) => {
      res.redirect("/category");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
const category_block = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for block");

  Category.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/category");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
  // res.redirect('/admin-log')
};
const category_unblock = (req, res) => {
  let id = req.params.id;
  console.log(id + "this is the id for block");

  Category.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { delete: false } }
  )
    .then((result) => {
      res.redirect("/category");
      console.log("this is the result" + result);
    })
    .catch((err) => console.log("404", { title: "Blog not found" }));
};
//-------------export-items-------------
module.exports = {
  home,
  customer,
  customer_block,
  customer_unblock,
  login_admin,
  product,
  Editadmin_product,
  update_product,
  product_add,
  singleadmin_product,
  product_post,
  product_block,
  product_unblock,
  coupen,
  add_coupen,
  coupen_update,
  coupen_block,
  coupen_unblock,
  category,
  add_category,
  category_update,
  category_block,
  category_unblock,
};
