require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRouter      = require("./routes/auth");
const entriesRouter   = require("./routes/entries");
const analyzeRouter   = require("./routes/analyze");
const companionRouter = require("./routes/companion");
const chatRouter      = require("./routes/chat");
const errorHandler    = require("./middleware/errorHandler");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/entries",   entriesRouter);
app.use("/api/analyze",   analyzeRouter);
app.use("/api/companion", companionRouter);
app.use("/api/chat",      chatRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mindclassify-backend" });
});

// ── Error handling ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mindclassify";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
