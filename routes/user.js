const { Router } = require("express");
const { UserController } = require("../controllers");
const middleware = require("../middleware/user");

const router = Router();

router.post("/login", middleware.hasUsernameAndPassword, UserController.login);
router.post("/signup", middleware.isValidSignUpRequest, UserController.signup);
router.get("/profile", middleware.isAuthorized, UserController.profile);

module.exports = router;
