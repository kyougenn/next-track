require('dotenv').config();

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.MARIA_HOST || '127.0.0.1',
    database: process.env.MARIA_DATABASE || 'nexttrack',
    user: process.env.MARIA_USER || 'nexttrack_user',
    password: process.env.MARIA_PASSWORD || 'cm3070',
    port: 3306,
    connectionLimit: 64,
    pingInterval: 60000
});

module.exports = pool;