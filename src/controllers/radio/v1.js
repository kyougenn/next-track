const crypto = require('node:crypto');
const fetch = require('node-fetch');

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
            "loudness": [],
            "speechiness": [],
            "acousticness": [],
            "instrumentalness": [],
            "liveness": [],
            "valence": []
        }

        //req.query.id

        if (req.query.id != undefined) {
            user_data = await redis.getUser(req.query.id);

            if (user_data.tracks.length != 0) {
                for (const track of user_data.tracks) {
                    const rows = await conn.query('SELECT danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence FROM tracks WHERE id = ?', [track]);
        
                    //check if song exists
                    for (const key of Object.keys(rows[0])) {
                        attributes[key].push(rows[0][key]);
                    }        
                };
            }
        }

        // check if request body not empty
        // for (const track of req.body.preferences.ignore_tracks) {
        //     params.push(track);
        //     sql += 'id != ? AND ';
        // };

        Object.keys(req.body.attributes).forEach((key) => {
            // find a way to get target value based on previously selected tracks

            let target = 0.5;

            if (attributes[key].length != 0) {
                target = 0.0;

                attributes[key].map((value) => {
                    target += value;
                });

                // maybe add the ability to change type of average? mean? mode?
                target = target / attributes[key].length;
            }

            let variance = req.body.attributes[key]
            params.push(target - variance, target + variance);
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

        if (tracks[0] !== undefined) {
            const artists = await conn.query('SELECT * FROM trackArtists WHERE song = ?', [tracks[0].id]);
            
            let artist_names = [];

            for (const artist of artists) {
                const name = await conn.query('SELECT * FROM artistNames WHERE id = ?', [artist.artist]);
                artist_names.push(name[0]);
            };

            // artists.forEach((artist) => {
            //     conn.query('SELECT * FROM artistNames WHERE id = ?', [artist.artist]).then((rows) => {
            //         artist_names.push(rows[0])
            //     });
            // })

            console.log(artist_names)

            res.status(200).json({
                ...tracks[0],
                artists: artist_names
            })
        } else {
            res.status(404);
        }
    } catch (err) {
        console.log(`Connection Error: ${err}`);
    } finally {
        if (conn) return conn.end();
    }
}

exports.test = async (req, res) => {
    let user_id = await redis.createUser();
    let user_data = await redis.getUser(user_id);
    await redis.updateUser(user_id, 'tracks', [...user_data.tracks, '0yLdNVWF3Srea0uzk55zFn']);

    res.status(200).json({
        ...await redis.getUser(user_id),
        'id': user_id
    });
}

exports.next = (req, res) => {
    res.status(200).json({

    });
}

exports.tune = (req, res) => {

    req.body.tracks

    res.status(200).json({

    });
}


async function getArticle() {
    fetch('https://raw.githubusercontent.com/KoreanThinker/billboard-json/main/billboard-hot-100/recent.json', { method: "Get" })
    .then(res => res.json())
    .then((json) => {
        return json.data[Math.floor(Math.random() * (json.data.length - 1))];
    });
}