const crypto = require('node:crypto');

const redis = require('../../utils/redis');

exports.create = async (req, res) => {
    res.status(200).json({
        "id": await redis.createUser()
    });
}

// check if req body is present
exports.update = async (req, res) => {
    for (const key of Object.keys(req.body)) {
        await redis.updateUser(req.query.id, key, req.body[key]);
    }

    res.status(200).json({
        ...await redis.getUser(req.query.id),
        'id': req.query.id
    });
}

// test this and make better
exports.delete = async (req, res) => {
    res.status(200).json({
        "success": await redis.deleteUser(req.query.id)
    });
}