const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), "../../.env") });
const { Author, Book } = require("./models");

const models = {
  "/author": Author,
  "/book": Book
};

function saveToDb(data, from) {
  const model = models[from];

  return model.upsert(data);
}

module.exports = { saveToDb };
