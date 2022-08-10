const { Router } = require("express");
const { UserController } = require("../controllers");
const { body } = require('express-validator');

const router = Router();

router.post("/login/",[
    body('username').exists(),
    body('pwd').exists()
] ,UserController.login);
router.post("/signup",[
    body('username').isLength({ min: 5 }),
    body('pwd').isLength({ min: 8 }),
    body('email').isEmail()
], UserController.signup);
router.get("/profile", UserController.profile);

module.exports = router;
