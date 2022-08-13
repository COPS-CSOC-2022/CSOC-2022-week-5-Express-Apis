const Token = require("../models/token");
const User = require("../models/user");

var middlewareObj = {};

middlewareObj.isAuthorized = async (req, res, next) => {
  let header = req.headers.authorization;
  let token = header.split(" ")[1];
  if (!token) {
    return res.status(404).json({ error: "Token not found" });
  }

  if (header && header.split(" ")[0] == "Token") {
    let result = await Token.findOne({ token: token });
    if (result) {
      User = User.populate("user");
      req.user = User.user;
      return next();
    } else {
      return res.status(404).json({
        error: "Token does not belong to any user.",
      });
    }
  } else {
    return res.status(401).json({
      error: `Incorrect header used for validation! Header should be of the format "Token <Token>"`,
    });
  }
};

middlewareObj.collabValidator = function (req, res, next) {
  if (req.body.collaborator == null || req.body.collaborator === undefined)
    return res.status(400).json({
      error: "Missing username of collaborator",
    });
  next();
};

middlewareObj.signupValidator = function (req, res, next) {
  if (
    req.body.username == "" ||
    req.body.password == "" ||
    req.body.email == "" ||
    req.body.name == ""
  ) {
    return res.status(400).json({
      error: "Missing required fields (username, password, email or name).",
    });
  }
  return next();
};

middlewareObj.loginValidator = function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      error: "Missing required fields (username or password)",
    });
  }
  return next();
};

middlewareObj.titleValidator = function (req, res, next) {
  if (req.body.title == null || req.body.title === undefined) {
    return res.status(400).json({
      error: "Title field required.",
    });
  }

  if (req.body.title.trim().length() == 0) {
    return res.status(400).json({
      error: "Enter a valid title",
    });
  }

  next();
};

module.exports = middlewareObj;
