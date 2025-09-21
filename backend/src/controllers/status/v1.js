exports.next = (req, res) => {
    res.status(200).json({
        'status': 200,
        'serverTime': Date.now(),
        'uptime': `${Math.floor(process.uptime()/60)}m`,
    });
}