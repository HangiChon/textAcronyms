const express = require("express");
const mongoose = require("mongoose");

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

//************************************************//
//   GET /acronym?page=1&limit=10&search=:search  //
//************************************************//
app.get("/acronym", getAcronyms);

//************************************************//
//                 POST /acronym                  //
//************************************************//
app.post("/acronym", addAcronym);

//************************************************//
//            PATCH /acronym/:acronymID           //
//************************************************//
app.patch("/acronym/:acronymID", updateAcronym);

//************************************************//
//           DELETE /acronym/:acronymID           //
//************************************************//
app.delete("/acronym/:acronymID", deleteAcronym);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
