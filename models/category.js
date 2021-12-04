const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Category = sequelize.define('category', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  category_name: Sequelize.STRING
});

module.exports = Category;
