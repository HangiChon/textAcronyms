const { Acronym } = require("./seeds");
const mongoose = require("mongoose");

// response template
const response = (res, code, msg, data) => {
  return res.status(code).json({ status: code, data: data, message: msg });
};

//************************************************//
//   GET /acronym?page=1&limit=10&serach=:search  //
//************************************************//
const getAcronyms = (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const { search } = req.query;

  // patterns used to match character combinations in strings
  const escapeRegex = text => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };

  try {
    // pagination info to be used in response
    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;
    const results = {};

    // formulate returned result from db
    const formulateFoundResult = foundResult => {
      // consistent logic for showing previous page
      if (startIdx > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        };
      }
      // results.next depends on fetched result
      if (endIdx < foundResult.length) {
        results.next = {
          page: page + 1,
          limit: limit
        };
      }
      results.total = foundResult.length;
      results.result = foundResult.slice(startIdx, endIdx);

      return results;
    };

    // fuzzy or full search
    if (search) {
      // apply RegExp for fuzzy search (to be improved by using mongoDB's fuzzy query method)
      const regex = new RegExp(escapeRegex(search), "gi");

      // find matched strings and formulate response accordingly
      Acronym.find({ "acronym": regex }, (err, foundAcronyms) => {
        foundAcronyms.length
          ? response(
              res,
              200,
              "Successfully retrieved acronym(s)",
              formulateFoundResult(foundAcronyms)
            )
          : response(res, 400, "No matching acronyms found");
      });

      // no search query
    } else {
      Acronym.find({}, (err, allAcronyms) => {
        allAcronyms.length
          ? response(
              res,
              200,
              "Successfully retrieved all acronyms",
              formulateFoundResult(allAcronyms)
            )
          : response(res, 400, "Something went wrong");
      });
    }
  } catch (error) {
    return response(res, 500, "Server Error");
  }
};

//************************************************//
//                 POST /acronym                  //
//************************************************//
const addAcronym = async (req, res) => {};

//************************************************//
//            PATCH /acronym/:acronymID           //
//************************************************//
const updateAcronym = async (req, res) => {};

//************************************************//
//           DELETE /acronym/:acronymID           //
//************************************************//
const deleteAcronym = async (req, res) => {};

module.exports = { getAcronyms, addAcronym, updateAcronym, deleteAcronym };
