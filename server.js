// bring URI from .env file
require("dotenv").config();

const express = require("express");
const { MONGO_URI } = process.env;
const mongoose = require("mongoose");

// utils and handlers
const { Acronym, injectData } = require("./seeds");
const {
  getAcronyms,
  addAcronym,
  updateAcronym,
  deleteAcronym
} = require("./handlers");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static("public"));

// connect to mongoDB using mongoose
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected!!!!");
});

// verify model existence to avoid redundant seeding
mongoose.connection.once("open", async () => {
  if ((await Acronym.countDocuments().exec()) > 0) {
    console.log("Acronyms already exist in database.");
  } else {
    injectData();
    console.log("Acronyms added for the first time.");
  }
});

//************************************************//
//   GET /acronym?page=1&limit=10&serach=:search  //
//************************************************//
app.get("/acronym", getAcronyms);

//************************************************//
//                 POST /acronym                  //
//************************************************//
app.post("/acronym", addAcronym);

//************************************************//
//            PATCH /acronym/:acronymID           //
//************************************************//
// app.patch();

//************************************************//
//           DELETE /acronym/:acronymID           //
//************************************************//
// app.delete();

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
