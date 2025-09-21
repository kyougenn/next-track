const pool = require('../../utils/maria');

exports.search = async (req, res) => {

    let conn;
    
    try {
        conn = await pool.getConnection();
        
        let sql = `SELECT id, name FROM ${req.query.type == 'artist' ? 'artistNames' : 'tracks'} WHERE name LIKE ? `;
        let params = [];

        req.query.q.split(' ').map((param, i) => {
            params.push(`%${param}%`);
            if (i != 0) {sql += 'AND name LIKE ? '};
        });

        params.push(req.query.limit == undefined ? 10 : parseInt(req.query.limit));

        const rows = await conn.query(`${sql}LIMIT ?`, params);

        rows[0] !== undefined ? res.status(200).json(rows) : res.status(404);
    } catch (err) {
        console.log(`Connection Error: ${err}`);
    } finally {
        if (conn) return conn.end();
    }
}