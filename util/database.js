const Sequelize = require('sequelize');

const sequelize = new Sequelize('quotes-app', 'root', 'orinag1995', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
