const express = require("express");
const notesController = require("./../controllers/notesController");
const router = express.Router();
const bodyParser = require("body-parser");
const authController = require("./../controllers/authController");

const jsonParser = bodyParser.json();

const urlencodedParser = bodyParser.urlencoded({ extended: false });

// authController.protect -> use it for authentication before notesController.getAllNotes

router.route("/").get(notesController.getAllNotes);

router.route("/addnote").post(jsonParser, notesController.createNote);

router.route("/:id/").patch(urlencodedParser, notesController.updateNote);

//authController.restrictTo("admin"), authController.protect -> use it for authentication before authController.restrictTo("admin")

router
  .route("/:id/")
  .get(notesController.getANote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

module.exports = router;
