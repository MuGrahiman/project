let mongoose = require("mongoose");
mongoose.set("strictQuery", false);
let schema = mongoose.Schema;
let coupenschema = new schema(
  {
 
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    discount: {
        type: Number,
        required: true,
      },
    expiry: {
        type: Date,
        required: true,
      },
      user:[ {
        type: String,
        // required: true,
      }],
    delete: {
      type: Boolean,
      defualt: false,
    },
  },
  { timestamps: true }
);

let Coupen = mongoose.model("coupen",  coupenschema);

module.exports = Coupen;
