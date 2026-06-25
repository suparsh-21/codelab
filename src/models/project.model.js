const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      default: "javascript",
    },
    code: {
      type: String,
      default: "",
    },
    files: [
      {
        name: { type: String, required: true },
        path: { type: String, required: true },
        type: { type: String, enum: ["file", "folder"], required: true },
        content: { type: String, default: "" },
      }
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
