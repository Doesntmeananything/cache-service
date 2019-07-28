const { STRING, INTEGER, UUID, UUIDV4 } = require("sequelize");
const sequelize = require("./sequelize");

const Author = sequelize.define("author", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    unique: true
  },
  name: {
    type: STRING,
    allowNull: false
  },
  age: {
    type: INTEGER,
    allowNull: false
  }
});

const Book = sequelize.define("book", {
  authorId: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    unique: true
  },
  title: {
    type: STRING,
    allowNull: false
  },
  pages: {
    type: INTEGER,
    allowNull: false
  }
});

Author.hasMany(Book, { foreignKey: "authorId", sourceKey: "id" });
Book.belongsTo(Author, { foreignKey: "authorId", targetKey: "id" });

module.exports = { Author, Book };
