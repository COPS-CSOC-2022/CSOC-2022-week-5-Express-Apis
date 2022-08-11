const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next();                        // Only hash the password if it has been modified (or is new)

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {                 // Generate a salt
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/* Method for password validation */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(uniqueValidator);

module.exports = model("User", userSchema);
