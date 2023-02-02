let mongoose = require("mongoose");
mongoose.set("strictQuery", false);
let schema = mongoose.Schema;
let userschema = new schema(
  {product: [],
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  delete: {
    type:Boolean,
    defualt:false
  },
  }, { timestamps: true }
);


let Project = mongoose.model("projects", userschema);

module.exports = Project;
