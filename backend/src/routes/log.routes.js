const express = require("express");
const { getLogs } = require("../controllers/log.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.get("/", getLogs);

module.exports = router;
