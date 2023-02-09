console.log("IN THE ORDER SCHEMA");

let mongoose = require("mongoose");
mongoose.set("strictQuery", false);
let schema = mongoose.Schema;

let orderschema = new schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "projects",
    },

    product: { 
      type: mongoose.Types.ObjectId,
      ref: "products",
    },

    coupen: {
      type: mongoose.Types.ObjectId,
      ref: "coupen",
    },

    finalAmount: { type: Number },
  },
  { timestamps: true }
);
let Order = mongoose.model("order", orderschema);

module.exports = Order;