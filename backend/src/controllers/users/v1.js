const pool = require('../../utils/maria');
const redis = require('../../utils/redis');

exports.put = async (req, res) => {
    res.status(200).json({
        "id": await redis.createUser(parseInt(req.query.ttl))
    });
}

exports.post = async (req, res) => {
    for (const key of Object.keys(req.body)) {
        await redis.updateUser(req.query.id, key, req.body[key], parseInt(req.query.ttl));
    }

    let attributes = {
        "danceability": [],
        "energy": [],
        "speechiness": [],
        "acousticness": [],
        "instrumentalness": [],
        "liveness": [],
        "valence": []
    }

    user_data = await redis.getUser(req.query.id);

    let conn;
    try {
        conn = await pool.getConnection();

        if (user_data.tracks.length != 0) {
            for (const track of user_data.tracks) {
                const rows = await conn.query('SELECT danceability, energy, speechiness, acousticness, instrumentalness, liveness, valence FROM tracks WHERE id = ?', [track]);
                for (const key of Object.keys(rows[0])) {
                    attributes[key].push(rows[0][key]);
                }        
            };
        }
    
        let response = {};

        Object.keys(attributes).forEach((key) => {
            let target = 0.5;
    
            if (attributes[key].length != 0) {
                target = 0.0;
                attributes[key].map((value) => {
                    target += value;
                });
                response[key] = target / attributes[key].length;
            }
        });

        res.status(200).json({
            ...user_data,
            'id': req.query.id,
            'target': response
        });
    } catch (err) {
        console.log(`Connection Error: ${err}`);
    } finally {
        if (conn) return conn.end();
    }
}

exports.get = async (req, res) => {
    let attributes = {
        "danceability": [],
        "energy": [],
        "speechiness": [],
        "acousticness": [],
        "instrumentalness": [],
        "liveness": [],
        "valence": []
    }

    user_data = await redis.getUser(req.query.id);

    let conn;
    try {
        conn = await pool.getConnection();

        if (user_data.tracks.length != 0) {
            for (const track of user_data.tracks) {
                const rows = await conn.query('SELECT danceability, energy, speechiness, acousticness, instrumentalness, liveness, valence FROM tracks WHERE id = ?', [track]);
                for (const key of Object.keys(rows[0])) {
                    attributes[key].push(rows[0][key]);
                }        
            };
        }
    
        let response = {};

        Object.keys(attributes).forEach((key) => {
            let target = 0.5;
    
            if (attributes[key].length != 0) {
                target = 0.0;
                attributes[key].map((value) => {
                    target += value;
                });
                response[key] = target / attributes[key].length;
            }
        });

        res.status(200).json({
            ...user_data,
            'id': req.query.id,
            'target': response
        });
    } catch (err) {
        console.log(`Connection Error: ${err}`);
    } finally {
        if (conn) return conn.end();
    }
}

exports.delete = async (req, res) => {
    let result = await redis.deleteUser(req.query.id)

    res.status(result ? 200 : 500).json({
        'status': result ? 200 : 500,
        'serverTime': Date.now(),
        'message': result ? 'Success' : 'Error'
    });
}