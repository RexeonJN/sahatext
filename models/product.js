const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING,
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  color: Sequelize.STRING,

  selling_price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },

  discount_price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },

  product_code: {
    type: Sequelize.INTEGER,
    allowNull: false
  },

  product_qty: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  
  status: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },

  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;
