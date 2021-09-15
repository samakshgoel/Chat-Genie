const Sequelize = require('sequelize')

const userModel = require('./user/user');



const db = 'socialLogin';
const username = "postgres";
const password = "support";
exports.dbconfig = new Sequelize.Sequelize(db, username, password, {
  port: 5432,
  host: "10.0.0.2",
  dialect: "postgres",
  logging: false,
});

exports.userModel = userModel(exports.dbconfig);