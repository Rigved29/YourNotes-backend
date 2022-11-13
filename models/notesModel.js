const mongoose = require("mongoose");

const notes_Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A note must have a title"],
    unique: true,
    trim: true,
  },
  noteBody: {
    type: String,
    required: [true, "A note must have a body/content"],
    trim: true,
  },
  author: {
    type: String,
    // required: [true, "A note must have a author name"],
    trim: true,
  },
  date: {
    type: Date,
    trim: true,
  },
  likes: {
    type: Number,
  },
});

const Note = mongoose.model("Note", notes_Schema);

module.exports = Note;
