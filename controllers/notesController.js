const NoteModel = require("./../models/notesModel");

exports.getAllNotes = async (req, res) => {
  try {
    const allNotes = await NoteModel.find();

    console.log(req.headers);

    res.status(200).json({
      status: "success",
      results: allNotes.length,
      data: {
        notes: allNotes,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getANote = async (req, res) => {
  try {
    const note = await NoteModel.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        note: note,
      },
    });
    console.log(note);
  } catch (err) {
    console.log(err);
  }
};

exports.createNote = async (req, res) => {
  try {
    const newNote = await NoteModel.create(req.body);
    console.log(req.body, newNote, "CREATED NOTE");
    res.status(201).json({
      status: "success",
      data: {
        note: newNote,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateNote = async (req, res) => {
  try {
    const updatedNote = await NoteModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        note: updatedNote,
      },
    });
    console.log(updatedNote, req.params.id, req.body);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent",
    });
    console.log(err);
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await NoteModel.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
      message: "deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid",
    });
    console.log(err);
  }
};
