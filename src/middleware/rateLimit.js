const rateLimiter = require("express-rate-limit");

module.exports = rateLimiter({
    limit: 100,
    windowMs: 60000,
    message: { 'status': 429, 'serverTime': Date.now(), 'message': 'Rate Limited' },
});