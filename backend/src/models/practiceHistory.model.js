const mongoose = require("mongoose");

const practiceHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phrase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Phrase",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    fluency: {
      type: Number,
      default: 0,
    },
    pronunciation: {
      type: Number,
      default: 0,
    },
    wordAnalysis: [
      {
        word: String,
        score: Number,
        feedback: String,
        timestamp: Number, // Position in audio
      },
    ],
    audioUrl: {
      type: String,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    duration: {
      type: Number, // Duration in seconds
    },
    status: {
      type: String,
      enum: ["completed", "in-progress", "skipped"],
      default: "in-progress",
    },
  },
  {
    timestamps: true,
  }
);

// index for faster queries
practiceHistorySchema.index({ user: 1, phrase: 1 });
practiceHistorySchema.index({ user: 1, createdAt: -1 });

const PracticeHistory = mongoose.model(
  "PracticeHistory",
  practiceHistorySchema
);

module.exports = PracticeHistory;
