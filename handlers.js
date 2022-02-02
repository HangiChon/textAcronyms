// bring URI from .env file
require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const { MONGO_URI } = process.env;
const mongoose = require("mongoose");
const { Acronym, injectData } = require("./seeds");

// connect to mongoDB using mongoose
const activateConn = async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected!");
  });
};

// verify model existence to avoid redundant seeding
mongoose.connection.once("open", async () => {
  if ((await Acronym.countDocuments().exec()) > 0) {
    // console.log("Acronyms already exist in database.");
    return;
  } else {
    injectData();
    console.log("Acronyms added for the first time.");
  }
});

// disconnect mongoose
const deactivateConn = async () => {
  await mongoose.disconnect();
  console.log("Mongoose is disconnected!");
};

// response template
const response = (res, code, msg, data) => {
  return res.status(code).json({ status: code, data: data, message: msg });
};

// initial connection required to inject data
activateConn();

//************************************************//
//   GET /acronym?page=1&limit=10&search=:search  //
//************************************************//
const getAcronyms = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const { search } = req.query;
  let results = {};
  await activateConn();

  // patterns used to match character combinations in strings
  const escapeRegex = text => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };

  try {
    // fuzzy or full search
    if (search) {
      // apply RegExp for fuzzy search (to be improved by using mongoDB's fuzzy query method)
      const regex = new RegExp(escapeRegex(search), "gi");

      // get total result quantity
      const resultLength = (await Acronym.find({ "acronym": regex })).length;

      // find matched strings and formulate response accordingly
      Acronym.find({ "acronym": regex })
        .limit(limit)
        .skip(page * limit)
        .exec(async (err, matchedAcronyms) => {
          results = {
            total: resultLength,
            result: matchedAcronyms,
            // show available result quantity in previous and next page
            // if next page only has X number of results, the limit will appear to be X
            // These admittedly messy looking ternary operators can be improved
            // by implementing mongoose built-in methods in the future
            previous:
              page > 0
                ? limit * (page - 1) < resultLength
                  ? {
                      page: page - 1,
                      limit:
                        resultLength - limit * (page - 1) < limit
                          ? resultLength - limit * (page - 1)
                          : limit
                    }
                  : {}
                : {},
            next:
              (page + 1) * limit < resultLength
                ? {
                    page: page + 1,
                    limit:
                      limit * (page + 2) < resultLength
                        ? limit
                        : limit * (page + 1) < resultLength
                        ? resultLength % (limit * (page + 1))
                        : {}
                  }
                : {}
          };

          if (err) {
            response(res, 400, "Something went wrong", err);
          } else {
            response(res, 200, "Successfully retrieved all acronyms", results);
          }
          await deactivateConn();
        });

      // no search query
    } else {
      // get total result quantity
      const resultLength = (await Acronym.find({})).length;

      Acronym.find({})
        .limit(limit)
        .skip(page * limit)
        .exec(async (err, allAcronyms) => {
          results = {
            total: resultLength,
            result: allAcronyms,
            previous:
              page > 0
                ? limit * (page - 1) < resultLength
                  ? {
                      page: page - 1,
                      limit:
                        resultLength - limit * (page - 1) < limit
                          ? resultLength - limit * (page - 1)
                          : limit
                    }
                  : {}
                : {},
            next:
              (page + 1) * limit < resultLength
                ? {
                    page: page + 1,
                    limit:
                      limit * (page + 2) < resultLength
                        ? limit
                        : limit * (page + 1) < resultLength
                        ? resultLength % (limit * (page + 1))
                        : {}
                  }
                : {}
          };

          if (err) {
            response(res, 400, "Something went wrong", err);
          } else {
            response(res, 200, "Successfully retrieved all acronyms", results);
          }
          await deactivateConn();
        });
    }
  } catch (error) {
    return response(res, 500, "Server Error", error);
  }
};

//************************************************//
//                 POST /acronym                  //
//************************************************//
const addAcronym = async (req, res) => {
  const { acronym, definition } = req.body;

  try {
    await activateConn();

    Acronym.create(
      { _id: uuidv4(), acronym, definition },
      async (err, result) => {
        const { acronym, definition } = result;

        if (err) {
          response(res, 400, "Something went wrong", err);
        } else {
          response(res, 200, "Successfully added a texting abbreviation", {
            acronym,
            definition
          });
        }
        await deactivateConn();
      }
    );
  } catch (error) {
    response(res, 500, "Server Error", error);
  }
};

//************************************************//
//            PATCH /acronym/:acronymID           //
//************************************************//
const updateAcronym = async (req, res) => {
  const { acronymID } = req.params;
  const { acronym: newAcronym, definition: newDefinition } = req.body;

  try {
    await activateConn();

    Acronym.findOneAndUpdate(
      { _id: acronymID },
      { acronym: newAcronym, definition: newDefinition },
      async (err, result) => {
        const { acronym, definition } = result;

        if (err) {
          response(res, 400, "Something went wrong", err);
        } else {
          response(res, 200, "Successfully updated a texting abbreviation", {
            acronym: acronym + "->" + newAcronym,
            definition: definition + "->" + newDefinition
          });

          await deactivateConn();
        }
      }
    );
  } catch (error) {
    response(res, 500, "Server Error", error);
  }
};

//************************************************//
//           DELETE /acronym/:acronymID           //
//************************************************//
const deleteAcronym = async (req, res) => {
  const { acronymID } = req.params;

  try {
    await activateConn();

    Acronym.findOneAndDelete({ _id: acronymID }, async (err, result) => {
      const { acronym, definition } = result;

      if (err) {
        response(res, 400, "Something went wrong", err);
      } else {
        response(res, 200, "Successfully deleted the acronym", {
          acronym,
          definition
        });
      }
      await deactivateConn();
    });
  } catch (error) {
    response(res, 500, "Server Error", error);
  }
};

module.exports = { getAcronyms, addAcronym, updateAcronym, deleteAcronym };
