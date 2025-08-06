//require('dotenv').config();

exports.next = (req, res) => {
  res.status(200).json({
    "status": "up",
    "version": "1.0.0",
    "environment": "production",
    "uptime": `${Math.floor(process.uptime()/60)}m`,
  });
}