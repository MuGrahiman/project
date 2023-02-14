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
const Order = require("../../models/orderschema");
let adminno = 226688;

const home = (req, res) => {
  res.render("admin/admin-home.ejs", { title: "admin-home" });
};
const login_admin = (req, res) => {
  if (adminno == req.body.password) {
    req.session.admin = true;
    console.log("admin session created");
    res.redirect("/dashboard");
  } else {
    res.render("admin/admin-home.ejs", {
      title: "admin-home-error",
      error: "password not matching",
    });
  }
};
const dashboard = async (req, res) => {

  let product = await Product.find();
  let user = await Project.find();
   await Order.find()

let order = await
Order.aggregate([
  {
      $group: {
          "_id" : '_id',
          amount: {
             $sum: "$finalAmount" 
          } 
      }
  }
])

  res.render("admin/dashboard", {
    title: "admin-dashboard",
    product,order,user
  });
  
};
const purchase = (req, res) => {
  console.log("in the purchase code");
  

  Order.find()
    .populate("user")
    .populate("product")
    .populate("coupen")
    .then((result) => {
      res.render("admin/purchase", {
        title: "admin-purchase",
        product: result,
      });
    });

};
const customer = (req, res) => {
  Project.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("admin/admin-customer", {
        title: "admin-customer",
        project: result,
      });
    });
};
const customer_block = (req, res) => {
  let id = req.params.id;
  Project.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/admin-customer");
      console.log("this is the result" + result);
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
};
const customer_unblock = (req, res) => {
  let id = req.params.id;
  Project.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: false } })
    .then((result) => {
      res.redirect("/admin-customer");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
};
const product = (req, res) => {
  Product.find()
    .sort({ createdAt: -1 })
    .then((result) => {
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
    Product.findById(id)
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("admin/admin-edit-product", {
          title: "user-Product",
          product: result,
          category,
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
      if (file.fieldname == "file") {
        instalfile = file;
      } else if (file.fieldname == "img") {
        Image = file;
      } else if (file.fieldname == "imgs") {
        Images.push(file);
      }
    });
    let war = await Cloudinary.uploader.upload(Image.path, {
      public_id: Image.filename,
      transformation: [
        { width: 485, height: 485, crop: "fill" },
      ]
    });

    for (i = 0; i < Images.length; i++) {
   
      let mar = await Cloudinary.uploader.upload(Images[i].path, {
      public_id: Images[i].filename,
        transformation: [
          { width: 485, height: 485, crop: "fill" },
        ]
      });

      imgs.push({ public_id: mar.public_id, url: mar.url });
    }
    newproduct = new Product({
      file: instalfile.filename,
      title: req.body.title.toUpperCase(),
      developer: req.body.developer,
      release_date: req.body.release,
      category: req.body.category,
      version: req.body.version,
      genres: req.body.genres,
      cost: req.body.cost,
      about: req.body.about,
      delete:false,
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
      await newproduct.save()
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
  }
};

const update_product = async (req, res) => {
  try {
    const imgs = [];
    let img;
    let instalfile;
    let Image;
    let Images = [];
    let product = await Product.find({_id:req.params.id})
    req.files.forEach((file) => {
      if (file.fieldname == "file") {
        instalfile = file;
      } else if (file.fieldname == "img") {
        Image = file;
      } else if (file.fieldname == "imgs") {
        Images.push(file);
      }
    });
    if (instalfile) {
      req.body.file = req.files[2].filename
    }
   if (Image) {
      let war = await Cloudinary.uploader.upload( Image.path,
        {
          public_id:Image.filename,
          overwrite: true,
          invalidate: true,
          transformation: [
            { width: 485, height: 485, crop: "fill" },
          ]
        },
        
      );
      img = {
        public_id: war.public_id,
        url: war.url
      }

      req.body.img = img
   }
if (Images) {
  for (i = 0; i < Images.length; i++) {

    let mar = await Cloudinary.uploader.upload(Images[i].path, {
      public_id: Images[i].filename,
      overwrite: true,
      invalidate: true,
      transformation: [
        { width: 485, height: 485, crop: "fill" },
      ]
    });

    imgs.push({ public_id: mar.public_id, url: mar.url });
  }
  req.body.imgs = imgs
}
    
await Product.findByIdAndUpdate(req.params.id, req.body)
.then((result)=>{
  Product.find()
  .sort({ createdAt: -1 })
  .then((result) => {
    res.render("admin/admin-product", {
      title: "admin-product",
      product: result,
     
    });
  });
})

  } catch (err) {
    Product.find()
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("admin/admin-product", {
          title: "admin-product",
          category: result,
          err,
        });
      });
  }



};
const product_block = (req, res) => {
  let id = req.params.id;

  Product.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/admin-product");
    })
    .catch((err) =>{ console.log("404", { title: "Blog not found" })});
};
const product_unblock = (req, res) => {
  let id = req.params.id;

  Product.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: false } })
    .then((result) => {
      res.redirect("/admin-product");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
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
        res.redirect("/coupen");
      })
      .catch((err) => {console.log(err)});
  }
};
const coupen_update = (req, res) => {
  let id = req.params.id;
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
    })
    .catch((err) => {console.log("404 " + err)});
};
const coupen_block = (req, res) => {
  let id = req.params.id;
  Coupen.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/coupen");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
};
const coupen_unblock = (req, res) => {
  let id = req.params.id;
  Coupen.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: false } })
    .then((result) => {
      res.redirect("/coupen");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
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
    title: req.body.name.toUpperCase(),
    delete: false,
  });
  await newcategory
    .save()
    .then((result) => {
      res.redirect("/category");
    })
    .catch((err) => {console.log(err)});
};
const category_update = (req, res) => {
  let id = req.params.id;
  Category.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { title: req.body.title.toUpperCase() } }
  )
    .then((result) => {
      res.redirect("/category");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
};
const category_block = (req, res) => {
  let id = req.params.id;
  Category.findByIdAndUpdate({ _id: req.params.id }, { $set: { delete: true } })
    .then((result) => {
      res.redirect("/category");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
};
const category_unblock = (req, res) => {
  let id = req.params.id;
  Category.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { delete: false } }
  )
    .then((result) => {
      res.redirect("/category");
    })
    .catch((err) => {console.log("404", { title: "Blog not found" })});
};
//-------------export-items-------------
module.exports = {
  home,
  customer,
  dashboard,
  purchase,
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
