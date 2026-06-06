const express     = require("express");
const router      = express.Router();
const { chat }    = require("../controllers/chatController");
const requireAuth = require("../middleware/requireAuth");

router.post("/", requireAuth, chat);

module.exports = router;
