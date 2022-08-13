const { Router } = require("express");
const { UserController } = require("../controllers");
const middlewareObj = require("../middleware/token_auth");
const { User } = require("../models");

const router = Router();

router.post("/login/", middlewareObj.loginValidator, UserController.login);
router.post("/signup", middlewareObj.signupValidator, UserController.signup);
router.get("/profile", middlewareObj.isAuthorized, UserController.profile);

module.exports = router;
