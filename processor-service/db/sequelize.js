const Sequelize = require("sequelize");

var pg = require("pg");
pg.defaults.ssl = true;

const sequelize = new Sequelize(process.env.DB_URL);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

sequelize.sync();

module.exports = sequelize;
