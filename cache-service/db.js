const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), "../.env") });

const Sequelize = require("sequelize");

var pg = require("pg");
pg.defaults.ssl = true;

const sequelize = new Sequelize(process.env.DB_URL);

// Return an array containing top authors
function fetchTopAuthors() {
  return sequelize
    .query(
      'SELECT  au.name, COUNT(*) BookCount FROM authors AS au INNER JOIN books ON  "books"."authorId" = au.id WHERE  books.pages > 200 GROUP BY au.name ORDER BY BookCount DESC LIMIT 5',
      { type: sequelize.QueryTypes.SELECT }
    )
    .then(authors => authors)
    .catch(error => {
      console.log(error);
      return res.json(error.toString());
    });
}

function fetchAllAuthors() {
  return sequelize
    .query("SELECT name, id FROM authors", {
      type: sequelize.QueryTypes.SELECT
    })
    .then(authors => authors)
    .catch(error => {
      console.log(error);
      return res.json(error.toString());
    });
}

module.exports = { fetchTopAuthors, fetchAllAuthors };
