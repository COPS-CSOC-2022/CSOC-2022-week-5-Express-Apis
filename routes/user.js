const { Router } = require("express");
const { UserController } = require("../controllers");
const middlewareObj = require("../middleware/token_auth");
const { User } = require("../models");

const router = Router();

router.post("/login/", UserController.login);
router.post("/signup", UserController.registerFieldsAreValid,UserController.validator({
    name: "string",
    email:"string",
    username:"string",
    password: "string",
  }),UserController.signup);
router.get("/profile", middlewareObj.isLoggedIn,UserController.profile);

module.exports = router;
