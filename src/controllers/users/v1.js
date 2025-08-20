const redis = require('../../utils/redis');

// add a check for ttl minimum 12 hrs max 365 days
exports.put = async (req, res) => {
    res.status(200).json({
        "id": await redis.createUser(parseInt(req.query.ttl))
    });
}

// check if req body is present
exports.post = async (req, res) => {
    for (const key of Object.keys(req.body)) {
        await redis.updateUser(req.query.id, key, req.body[key], parseInt(req.query.ttl));
    }

    res.status(200).json({
        ...await redis.getUser(req.query.id),
        'id': req.query.id
    });
}

exports.get = async (req, res) => {
    res.status(200).json({
        ...await redis.getUser(req.query.id),
        'id': req.query.id
    });
}

// make better TESTED!!!
exports.delete = async (req, res) => {

    let result = await redis.deleteUser(req.query.id)

    res.status(result ? 200 : 500).json({
        'status': result ? 200 : 500,
        'serverTime': Date.now(),
        'message': result ? 'Success' : 'Error'
    });
}