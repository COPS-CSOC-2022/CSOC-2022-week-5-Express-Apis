const { Router } = require("express");
const { UserController , middlewareObject } = require("../controllers");

const router = Router();

router.post("/login/", UserController.login);
router.post("/signup", UserController.signup);
router.get("/profile", middlewareObject.isLoggedIn ,UserController.profile);

module.exports = router;
