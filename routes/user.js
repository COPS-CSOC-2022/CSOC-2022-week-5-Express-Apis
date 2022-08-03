const { Router } = require("express");
const { UserController } = require("../controllers");

const router = Router();

router.post("/login/", UserController.login);
router.post("/signup", UserController.signup);
router.get("/profile", UserController.profile);

module.exports = router;
