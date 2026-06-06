const axios = require("axios");

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || "http://localhost:5001";

// POST /api/analyze
// Body: { text: string }
// Returns model prediction and optionally saves to an entry
exports.analyze = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing or empty 'text' field" });
    }

    const response = await axios.post(
      `${MODEL_SERVICE_URL}/predict`,
      { text: text.trim() },
      { timeout: 30000 }
    );

    res.json(response.data);
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Model service unavailable. Ensure model_service is running on port 5001.",
      });
    }
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};

// POST /api/analyze/batch
// Body: { texts: string[] }
exports.analyzeBatch = async (req, res, next) => {
  try {
    const { texts } = req.body;
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: "'texts' must be a non-empty array" });
    }

    const response = await axios.post(
      `${MODEL_SERVICE_URL}/batch_predict`,
      { texts },
      { timeout: 60000 }
    );

    res.json(response.data);
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "Model service unavailable" });
    }
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};
