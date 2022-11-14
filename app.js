const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const notesRouter = require("./routes/notesRoutes");
const userRoutes = require("./routes/userRoutes");

const corsOptions = {
  origin:
    "https://your-notes-git-rigved-branch-13-11-2022-rigved29.vercel.app/",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections);
    console.log("Db connection succesfull ✌");
  })
  .catch((err) => {
    console.log("ERROR :", err);
  });

// app.get("/", (req, res) => {
//   res.status(200).send("hello from the server✌✌");
// });

app.use("/", notesRouter, userRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`app is running on port ${port}...`);
});
