const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// acronyms data
const { abbreviations } = require("./data");

// 1. create mongoose Schema
const acronymSchema = new mongoose.Schema({
  _id: String,
  acronym: { type: String, required: true },
  definition: { type: String, required: true }
});

// 2. create mongoose model -> collection
const Acronym = mongoose.model("Acronym", acronymSchema);

// 3. iterate through data and create a document
// this function is called in server.js and designed to run only when the model does not exist in db
const injectData = () => {
  abbreviations.map(abbr => {
    for (const name in abbr) {
      const acronym = new Acronym({
        _id: uuidv4(),
        acronym: name,
        definition: abbr[name]
      });

      // 4. save document for each iteration
      acronym.save();
    }
  });
};

module.exports = { Acronym, injectData };
