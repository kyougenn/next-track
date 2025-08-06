//require('dotenv').config();
const crypto = require('node:crypto');

const redis = require('redis');

const client = redis.createClient({
    url: 'redis://default@10.24.2.105:6379'
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect();


exports.createUser = async () => {
    let user_id = crypto.randomBytes(8).toString('hex');
    await client.hSet('users:' + user_id, {
            'tracks': crypto.randomBytes(8).toString('hex'),
            'artists': crypto.randomBytes(8).toString('hex'),
            'ignored_tracks': crypto.randomBytes(8).toString('hex'),
            'ignored_artists': crypto.randomBytes(8).toString('hex')
        }
    )
    client.expireAt('users:' + user_id, parseInt((+new Date)/1000) + 86400);

    return user_id;
}

exports.updateUser = async (user_id, field, value) => {
    const user_data = await client.hGetAll('users:' + user_id);
    client.expireAt('users:' + user_id, parseInt((+new Date)/1000) + 86400);

    await client.del(field + ':' + user_data[field]);
    await client.rPush(field + ':' + user_data[field], value);
    client.expireAt(field + ':' + user_data[field], parseInt((+new Date)/1000) + 86400);
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




//module.exports = client;










// async function createUser() {
//     let user_id = crypto.randomBytes(8).toString('hex');
//     await client.hSet('users:' + user_id, {
//             'tracks': crypto.randomBytes(8).toString('hex'),
//             'artists': crypto.randomBytes(8).toString('hex'),
//             'ignored_tracks': crypto.randomBytes(8).toString('hex'),
//             'ignored_artists': crypto.randomBytes(8).toString('hex')
//         }
//     )
//     client.expireAt('users:' + user_id, parseInt((+new Date)/1000) + 86400);

//     return user_id;
// }

// async function updateList(user_id, field, value) {
//     const user_data = await client.hGetAll('users:' + user_id);
//     client.expireAt('users:' + user_id, parseInt((+new Date)/1000) + 86400);

//     await client.del(field + ':' + user_data[field]);
//     await client.rPush(field + ':' + user_data[field], value);
//     client.expireAt(field + ':' + user_data[field], parseInt((+new Date)/1000) + 86400);
// }

// async function getUser(user_id) {
//     const user_data = await client.hGetAll('users:' + user_id);
//     return {
//         'tracks': await client.lRange('tracks:' + user_data.tracks, 0, -1),
//         'artists':  await client.lRange('artists:' + user_data.artists, 0, -1),
//         'ignored_tracks': await client.lRange('ignored_tracks:' + user_data.ignored_tracks, 0, -1),
//         'ignored_artists':  await client.lRange('ignored_artists:' + user_data.ignored_artists, 0, -1)
//     }
// }