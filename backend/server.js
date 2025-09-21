var cors = require('cors');
var express = require('express');

const app = express();
const server = require('http').createServer(app);

const api = require("./src/index.js");

app.use(cors({ origin: '*', credentials: true }));

app.use("/", api);

server.listen(8080, () => {
    console.log('Listening on port 8080');
});