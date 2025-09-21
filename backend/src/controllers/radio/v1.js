const pool = require('../../utils/maria');
const redis = require('../../utils/redis');

exports.listen = async (req, res) => {

    let conn;

    try {
        conn = await pool.getConnection();

        let sql = 'SELECT id, name, image, preview, duration, explicit, published FROM tracks WHERE ';
        let params = [];

        let attributes = {
            "danceability": [],
            "energy": [],
            "speechiness": [],
            "acousticness": [],
            "instrumentalness": [],
            "liveness": [],
            "valence": []
        }

        if (req.query.id != undefined) {
            user_data = await redis.getUser(req.query.id);

            if (user_data.tracks.length != 0) {
                for (const track of user_data.tracks) {
                    const rows = await conn.query('SELECT danceability, energy, speechiness, acousticness, instrumentalness, liveness, valence FROM tracks WHERE id = ?', [track]);
                    for (const key of Object.keys(rows[0])) {
                        attributes[key].push(rows[0][key]);
                    }        
                };
            }

            if (user_data.ignored_tracks.length != 0) {
                for (const track of user_data.ignored_tracks) {
                    params.push(track);
                    sql += 'id != ? AND ';
                };
            }
        }        

        Object.keys(req.body.attributes).forEach((key) => {
            let target = req.body.attributes[key].target;

            if (attributes[key].length != 0) {
                target = 0.0;

                attributes[key].map((value) => {
                    target += value;
                });

                target = target / attributes[key].length;
            }

            let deviation = req.body.attributes[key].deviation

            params.push(target - deviation, target + deviation);
            sql += `${key} > ? AND ${key} < ? AND `;
        });

        if (req.body.tuning != undefined) {
            if (req.body.tuning.popularity != undefined) {
                params.push(req.body.tuning.popularity.min, req.body.tuning.popularity.max);
                sql += 'popularity >= ? AND popularity <= ? AND ';
            }
    
            if (req.body.tuning.tempo != undefined) {
                params.push(req.body.tuning.tempo.min, req.body.tuning.tempo.max);
                sql += 'tempo >= ? AND tempo <= ? AND ';
            }
    
            if (req.body.tuning.explicit != undefined) {
                params.push(req.body.tuning.explicit);
                sql += 'explicit = ? ';
            } else { sql += '1 '; }
        } else { sql += '1 '; }

        const tracks = await conn.query(`${sql} ORDER BY RAND() LIMIT 1`, params);

        //console.log(tracks)

        if (tracks[0] !== undefined) {
            const artists = await conn.query('SELECT * FROM trackArtists WHERE song = ?', [tracks[0].id]);
            
            let artist_names = [];

            for (const artist of artists) {
                const name = await conn.query('SELECT * FROM artistNames WHERE id = ?', [artist.artist]);
                artist_names.push(name[0]);
            };

            res.status(200).json({
                ...tracks[0],
                artists: artist_names
            });
        } else {
            res.status(404).json('Not Found');
        }
    } catch (err) {
        console.log(`Connection Error: ${err}`);
    } finally {
        if (conn) return conn.end();
    }
}