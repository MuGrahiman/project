let mongoose = require("mongoose");
const { array } = require("../config/multer");
mongoose.set("strictQuery", false);
const cloudinary = require("../config/cloudinary");
const { url } = require("../config/cloudinary");
let schema = mongoose.Schema;
console.log("IN THE PRODUCT SCHEMA");
let productschema = new schema(
  {
    file: {
      type: String,
      required: true,
    },
    img: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    imgs: [],
    title: {
      type: String,
      required: true,
    },
    developer: {
      type: String,
      required: true,
    },
    release_date: {
      type: Date,
      required: true,
    },
    category: {
      type: Array,
      required: true,
    },
    genres: {
      type: Array,
      required: true,
    },
    user: {
      type: Array,
    },
    cost: {
      type: Number,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    delete: {
      type: Boolean,
      defualt: false,
    },
  },
  { timestamps: true }
);

let Product = mongoose.model("products", productschema);

module.exports = Product;
