const { Schema, model } = require("mongoose");

const tokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
},
  {
    timestamps: true
  }
);

module.exports = model("Token", tokenSchema);
