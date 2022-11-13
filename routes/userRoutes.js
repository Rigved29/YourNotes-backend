const express = require("express");
const authController = require("./../controllers/authController");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const router = express.Router();

router.route("/signup").post(jsonParser, authController.signUp);

router.route("/login").post(jsonParser, authController.login);

router.route("/forgetPassword").post(jsonParser, authController.forgetPassword);
router
  .route("/resetPassword/:token")
  .patch(jsonParser, authController.resetPasssword);

module.exports = router;
