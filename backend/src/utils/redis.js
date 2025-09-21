require('dotenv').config();
const crypto = require('node:crypto');
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS
});

client.on('error', err => console.log('Redis Client Error', err));
client.connect();

exports.createUser = async (ttl) => {
    let user_id = crypto.randomBytes(8).toString('hex');
    await client.hSet('users:' + user_id, {
            'tracks': crypto.randomBytes(8).toString('hex'),
            'artists': crypto.randomBytes(8).toString('hex'),
            'ignored_tracks': crypto.randomBytes(8).toString('hex'),
            'ignored_artists': crypto.randomBytes(8).toString('hex')
        }
    );
    client.expireAt('users:' + user_id, parseInt((+new Date)/1000) + ttl * 3600);

    return user_id;
}

exports.updateUser = async (user_id, field, value, ttl) => {
    const user_data = await client.hGetAll('users:' + user_id);
    client.expireAt('users:' + user_id, parseInt((+new Date)/1000) + ttl * 3600);

    if (value.length > 0) {
        await client.del(field + ':' + user_data[field]);
        await client.rPush(field + ':' + user_data[field], value);
        client.expireAt(field + ':' + user_data[field], parseInt((+new Date)/1000) + ttl * 3600);
    }
}

exports.getUser = async (user_id) => {
    const user_data = await client.hGetAll('users:' + user_id);

    return {
        'tracks': await client.lRange('tracks:' + user_data.tracks, 0, -1),
        'artists':  await client.lRange('artists:' + user_data.artists, 0, -1),
        'ignored_tracks': await client.lRange('ignored_tracks:' + user_data.ignored_tracks, 0, -1),
        'ignored_artists':  await client.lRange('ignored_artists:' + user_data.ignored_artists, 0, -1)
    }
}

exports.deleteUser = async (user_id) => {
    const user_data = await client.hGetAll('users:' + user_id);
    await client.del('users:' + user_id);

    for (const field of Object.keys(user_data)) {
        await client.del(field + ':' + user_data[field]);
    }

    return true;
}