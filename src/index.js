//require('dotenv').config();

const express = require("express");
var cors = require('cors');

var bodyParser = require('body-parser');
const router = express.Router();

//const statusControllerV1 = require("./controllers/status/v1");
const radioControllerV1 = require("./controllers/radio/v1");
const toolsControllerV1 = require("./controllers/tools/v1");
const usersControllerV1 = require("./controllers/users/v1");

router.use(cors({ origin: '*', credentials: true, optionsSuccessStatus: 200 }));
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//router.use(require('./middleware/rateLimit'));

// get was changed to post to allow a json body to be within http 1.1 standards for get requests

//router.get("/api/v1/status", statusControllerV1.next);
router.post("/api/v1/radio/listen", radioControllerV1.listen);
router.post("/api/v1/radio/tune", radioControllerV1.tune);
router.get("/api/v1/radio/test", radioControllerV1.test);

router.get("/api/v1/tools/search", toolsControllerV1.search);

router.post("/api/v1/users/create", usersControllerV1.create);
router.post("/api/v1/users/update", usersControllerV1.update);

router.all("*", (req, res) => {
    console.log(req.url);
    res.status(404).json("Not Found");
});

module.exports = router;