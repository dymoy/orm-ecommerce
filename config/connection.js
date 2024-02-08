/**
 * @file connection.js
 * Creates the Sequelize instance to connect to the database
 *   
 * @see ../server.js
 */

// Use the dotenv package to use environment variables to store sensitive data such as MySQL username, password, and database name.
require('dotenv').config();

// Create the Sequelize instance 
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
  }
);

// Export the Sequelize instance to be used in ../server.js
module.exports = sequelize;
