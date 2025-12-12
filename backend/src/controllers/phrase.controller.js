const Phrase = require("../models/phrase.model");
const User = require("../models/user.model");


async function addPhrase(req, res) {
  try {
    const {
      text,
      meaning,
      example,
      language,
      level,
      audioUrl,
      audioMeaningUrl,
    } = req.body;

    if (!text || !level) {
      return res.status(400).json({ success: false, message: "Text and level are required" });
    }

    if (!["beginner", "intermediate", "expert"].includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Invalid level. Must be beginner, intermediate, or expert",
      });
    }

    const phrase = await Phrase.create({
      text: text,
      meaning,
      example,
      language: language || "English",
      level,
      audioUrl,
      audioMeaningUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Phrase added successfully",
      phrase,
    });
  } catch (error) {
    console.error("Add phrase error:", error);
    res
      .status(500)
      .json({ message: "Failed to add phrase", error: error.message });
  }
}

async function getAllPhrases(req, res) {
  try {
    const phrases = await Phrase.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: phrases.length,
      phrases,
    });
  } catch (error) {
    console.error("Get all phrases error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch phrases", error: error.message });
  }
}

async function updatePhrase(req, res) {
  try {
    const { id } = req.params;
    const {
      text,
      meaning,
      example,
      language,
      level,
      audioUrl,
      audioMeaningUrl,
    } = req.body;

    if (level && !["beginner", "intermediate", "expert"].includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Invalid level. Must be beginner, intermediate, or expert",
      });
    }

    const phrase = await Phrase.findByIdAndUpdate(
      id,
      {
        text,
        meaning,
        example,
        language,
        level,
        audioUrl,
        audioMeaningUrl,
      },
      { new: true, runValidators: true }
    );

    if (!phrase) {
      return res.status(404).json({ success: false, message: "Phrase not found" });
    }

    res.status(200).json({
      success: true,
      message: "Phrase updated successfully",
      phrase,
    });
  } catch (error) {
    console.error("Update phrase error:", error);
    res
      .status(500)
      .json({ message: "Failed to update phrase", error: error.message });
  }
}

async function deletePhrase(req, res) {
  try {
    const { id } = req.params;

    const phrase = await Phrase.findByIdAndDelete(id);

    if (!phrase) {
      return res.status(404).json({ success: false, message: "Phrase not found" });
    }

    res.status(200).json({
      success: true,
      message: "Phrase deleted successfully",
      deletedPhrase: phrase,
    });
  } catch (error) {
    console.error("Delete phrase error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete phrase", error: error.message });
  }
}

async function getPhrasesByLevel(req, res) {
  try {
    const { level } = req.params;

    if (!["beginner", "intermediate", "expert"].includes(level)) {
      return res.status(400).json({
        message: "Invalid level. Must be beginner, intermediate, or expert",
      });
    }

    const phrases = await Phrase.find({ level }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: phrases.length,
      level,
      phrases,
    });
  } catch (error) {
    console.error("Get phrases by level error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch phrases", error: error.message });
  }
}

async function getPhraseById(req, res) {
  try {
    const { id } = req.params;

    const phrase = await Phrase.findById(id);

    if (!phrase) {
      return res.status(404).json({ message: "Phrase not found" });
    }

    res.status(200).json({
      success: true,
      phrase,
    });
  } catch (error) {
    console.error("Get phrase by ID error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch phrase", error: error.message });
  }
}

async function markPhraseAsPracticed(req, res) {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const phrase = await Phrase.findById(id);
    if (!phrase) {
      return res.status(404).json({ message: "Phrase not found" });
    }

    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      message: "Phrase marked as practiced",
      phrase,
      score: score || null,
    });
  } catch (error) {
    console.error("Mark phrase as practiced error:", error);
    res.status(500).json({
      message: "Failed to mark phrase as practiced",
      error: error.message,
    });
  }
}

// Get practiced phrases for logged-in user
async function getPracticedPhrases(req, res) {
  try {
    res.status(200).json({
      success: true,
      practicedPhrases: [],
      message: "Practice history feature coming soon",
    });
  } catch (error) {
    console.error("Get practiced phrases error:", error);
    res.status(500).json({
      message: "Failed to fetch practiced phrases",
      error: error.message,
    });
  }
}

// Get user's progress statistics
async function getUserProgress(req, res) {
  try {
    const totalPhrases = await Phrase.countDocuments();
    const beginnerPhrases = await Phrase.countDocuments({ level: "beginner" });
    const intermediatePhrases = await Phrase.countDocuments({
      level: "intermediate",
    });
    const expertPhrases = await Phrase.countDocuments({ level: "expert" });

    res.status(200).json({
      success: true,
      progress: {
        total: totalPhrases,
        byLevel: {
          beginner: beginnerPhrases,
          intermediate: intermediatePhrases,
          expert: expertPhrases,
        },
        practiced: 0,
        mastered: 0,
        averageScore: 0,
      },
    });
  } catch (error) {
    console.error("Get user progress error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch progress", error: error.message });
  }
}

module.exports = {
  // Admin
  addPhrase,
  getAllPhrases,
  updatePhrase,
  deletePhrase,

  // User
  getPhrasesByLevel,
  getPhraseById,
  markPhraseAsPracticed,
  getPracticedPhrases,
  getUserProgress,
};
