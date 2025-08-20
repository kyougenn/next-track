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

        //check if user exists
        if (req.query.id != undefined) {
            user_data = await redis.getUser(req.query.id);

            if (user_data.tracks.length != 0) {
                for (const track of user_data.tracks) {
                    const rows = await conn.query('SELECT danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence FROM tracks WHERE id = ?', [track]);

                    //check if song exists, or else it will throw the error, check if rows is not [] or undefined cause no song exist
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

            //console.log()
            //req.body.attributes[key]

            let target = req.body.attributes[key].target;

            if (attributes[key].length != 0) {
                target = 0.0;

                attributes[key].map((value) => {
                    target += value;
                });

                // maybe add the ability to change type of average? mean? mode?
                target = target / attributes[key].length;
            }

            let deviation = req.body.attributes[key].deviation
            params.push(target - deviation, target + deviation);
            sql += `${key} > ? AND ${key} < ? AND `;
        });

        // add the ability to exclude already liked songs, probability of already liked songs appearing again
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

        //check if no tracks
        const tracks = await conn.query(`${sql} ORDER BY RAND() LIMIT 1`, params);

        console.log(tracks)


        if (tracks[0] !== undefined) {
            const artists = await conn.query('SELECT * FROM trackArtists WHERE song = ?', [tracks[0].id]);
            
            let artist_names = [];

            // check if no artists
            for (const artist of artists) {
                const name = await conn.query('SELECT * FROM artistNames WHERE id = ?', [artist.artist]);
                artist_names.push(name[0]);
            };

            // artists.forEach((artist) => {
            //     conn.query('SELECT * FROM artistNames WHERE id = ?', [artist.artist]).then((rows) => {
            //         artist_names.push(rows[0])
            //     });
            // })

            console.log(artist_names);

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

async function getArticle() {
    fetch('https://raw.githubusercontent.com/KoreanThinker/billboard-json/main/billboard-hot-100/recent.json', { method: "Get" })
    .then(res => res.json())
    .then((json) => {
        return json.data[Math.floor(Math.random() * (json.data.length - 1))];
    });
}