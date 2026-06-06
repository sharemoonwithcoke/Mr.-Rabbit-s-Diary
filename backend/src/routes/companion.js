const express     = require("express");
const router      = express.Router();
const ctrl        = require("../controllers/companionController");
const requireAuth = require("../middleware/requireAuth");

router.post("/", requireAuth, ctrl.companion);

module.exports = router;
