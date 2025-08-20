require('dotenv').config();

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.MARIA_HOST,
    database: process.env.MARIA_DATABASE,
    user: process.env.MARIA_USER,
    password: process.env.MARIA_PASSWORD,
    connectionLimit: 64,
    pingInterval: 60000
});

module.exports = pool;