const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Admin = sequelize.define('admin', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  resetToken: Sequelize.STRING,
  resetTokenExpiration: Sequelize.DATE
});

module.exports = Admin;
