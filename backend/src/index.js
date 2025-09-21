const express = require("express");
var cors = require('cors');

var bodyParser = require('body-parser');
const router = express.Router();

const statusControllerV1 = require("./controllers/status/v1");
const toolsControllerV1 = require("./controllers/tools/v1");
const usersControllerV1 = require("./controllers/users/v1");
const radioControllerV1 = require("./controllers/radio/v1");

router.use(cors({ origin: '*', credentials: true, optionsSuccessStatus: 200 }));
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(require('./middleware/rateLimit'));

router.get("/api/v1/status", statusControllerV1.next);

router.get("/api/v1/tools/search", toolsControllerV1.search);

router.put("/api/v1/users", usersControllerV1.put);
router.post("/api/v1/users", usersControllerV1.post);
router.get("/api/v1/users", usersControllerV1.get);
router.delete("/api/v1/users", usersControllerV1.delete);

router.post("/api/v1/radio/listen", radioControllerV1.listen);

router.all("*", (req, res) => {
    console.log(req.url);
    res.status(404).json("Not Found");
});

module.exports = router;