const express     = require("express");
const router      = express.Router();
const ctrl        = require("../controllers/analyzeController");
const requireAuth = require("../middleware/requireAuth");

router.post("/",       requireAuth, ctrl.analyze);
router.post("/batch",  requireAuth, ctrl.analyzeBatch);

module.exports = router;
