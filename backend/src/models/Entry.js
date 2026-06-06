const mongoose = require("mongoose");

const AnalysisResultSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    label_id: { type: Number, required: true },
    confidence: { type: Number, required: true },
    probabilities: { type: Map, of: Number },
  },
  { _id: false }
);

const EntrySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Diary content is required"],
      trim: true,
      minlength: [10, "Entry must be at least 10 characters"],
      maxlength: [10000, "Entry cannot exceed 10000 characters"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      default: "",
    },
    analysis: {
      type: AnalysisResultSchema,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reply: { type: String, default: null },
    followups: {
      type: [{
        user:  { type: String, required: true, trim: true },
        reply: { type: String, default: null },
        _id:   false,
      }],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual: short preview of content
EntrySchema.virtual("preview").get(function () {
  return this.content.length > 120 ? this.content.slice(0, 120) + "…" : this.content;
});

EntrySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Entry", EntrySchema);
