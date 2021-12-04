const Sequelize = require('sequelize');

const sequelize = new Sequelize('sahatext', 'root', '', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
