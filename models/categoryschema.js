let mongoose = require("mongoose");
mongoose.set("strictQuery", false);
let schema = mongoose.Schema;
let categoryschema = new schema(
  {
 
    title: {
      type: String,
      required: true,
    },

    delete: {
      type: Boolean,
      defualt: false,
    },
  },
  { timestamps: true }
);

let Category = mongoose.model("category",  categoryschema);

module.exports = Category;
