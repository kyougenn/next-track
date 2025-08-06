//require('dotenv').config();

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    connectionLimit: 64,
    user: 'node', // process.env.DB_USER,
    host: '10.24.2.81',
    database: 'track',
    password: 'node'
});

module.exports = pool;