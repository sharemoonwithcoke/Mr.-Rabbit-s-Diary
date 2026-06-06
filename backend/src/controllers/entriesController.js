const Entry = require("../models/Entry");

// GET /api/entries
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;
    const skip   = (Number(page) - 1) * Number(limit);
    const filter = { userId: req.user._id };

    const [entries, total] = await Promise.all([
      Entry.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Entry.countDocuments(filter),
    ]);

    res.json({
      entries,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/entries/:id
exports.getOne = async (req, res, next) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

// POST /api/entries
exports.create = async (req, res, next) => {
  try {
    const { content, title, analysis } = req.body;
    const entry = await Entry.create({ content, title, analysis, userId: req.user._id });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// PUT /api/entries/:id
exports.update = async (req, res, next) => {
  try {
    const allowed = ["content", "title", "analysis", "reply", "followups"];
    const $set = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) $set[key] = req.body[key];
    }
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/entries/:id
exports.remove = async (req, res, next) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
};
