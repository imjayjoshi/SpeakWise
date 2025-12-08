const PracticeHistory = require("../models/practiceHistory.model");
const Phrase = require("../models/phrase.model");
const User = require("../models/user.model");

async function savePracticeResult(req, res) {
  try {
    // Support phraseId from both URL params (/practice/:phraseId) and body (/save)
    const phraseId = req.params.phraseId || req.body.phraseId;
    
    const {
      score,
      accuracy,
      fluency,
      pronunciation,
      wordAnalysis,
      audioUrl,
      duration,
    } = req.body;

    // Validate phraseId
    if (!phraseId) {
      return res.status(400).json({ success: false, message: "Phrase ID is required" });
    }

    // Validate phrase exists
    const phrase = await Phrase.findById(phraseId);
    if (!phrase) {
      return res.status(404).json({ success: false, message: "Phrase not found" });
    }

    // Check if user alreadt practiced this phrase
    const existingPractice = await PracticeHistory.findOne({
      user: req.user._id,
      phrase: phraseId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = existingPractice
      ? existingPractice.attemptNumber + 1
      : 1;

    // Create new practice history
    const practiceHistory = new PracticeHistory({
      user: req.user._id,
      phrase: phraseId,
      score: score || 0,
      accuracy: accuracy || 0,
      fluency: fluency || 0,
      pronunciation: pronunciation || 0,
      wordAnalysis: wordAnalysis || [],
      audioUrl: audioUrl || null,
      duration: duration || 0,
      attemptNumber,
      status: "completed",
    });

    await practiceHistory.save();
    await updateUserStreak(req.user._id);

    res.status(201).json({
      success: true,
      message: "Practice result saved successfully",
      practiceHistory,
    });
  } catch (error) {
    console.error("Error saving practice result:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error.message });
  }
}

// Get user's practice history
async function getUserPracticeHistory(req, res) {
  try {
    const { limit = 20, page = 1 } = req.query;

    const practices = await PracticeHistory.find({
      user: req.user._id,
    })
      .populate("phrase", "text language level")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PracticeHistory.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      practices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get practice history error:", error);
    res.status(500).json({
      message: "Failed to fetch practice history",
      error: error.message,
    });
  }
}

// Get user statistics
async function getUserStatistics(req, res) {
  try {
    const userId = req.user._id;

    // Total practice
    const totalPractices = await PracticeHistory.countDocuments({
      user: userId,
    });

    // Unique phrase practiced
    const uniquePhrases = await PracticeHistory.distinct("phrase", {
      user: userId,
    });

    // Avarage Score
    const avgResult = await PracticeHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          avgAccuracy: { $avg: "$accuracy" },
          avgFluency: { $avg: "$fluency" },
          avgPronunciation: { $avg: "$pronunciation" },
        },
      },
    ]);

    const averages = avgResult[0] || {
      avgScore: 0,
      avgAccuracy: 0,
      avgFluency: 0,
      avgPronunciation: 0,
    };

    // Best Score
    const bestScore = await PracticeHistory.findOne({ user: userId })
      .sort({ score: -1 })
      .limit(1);

    // Recent practices (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPractices = await PracticeHistory.countDocuments({
      user: userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Practices by level
    const practiceByLevel = await PracticeHistory.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "phrases",
          localField: "phrase",
          foreignField: "_id",
          as: "phraseData",
        },
      },
      { $unwind: "$phraseData" },
      {
        $group: {
          _id: "$phraseData.level",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
    ]);

    // Total available Phrases
    const totalPhrasesAvailable = await Phrase.countDocuments();

    res.status(200).json({
      success: true,
      statistics: {
        totalPractices,
        uniquePhrasesPracticed: uniquePhrases.length,
        totalPhrasesAvailable,
        averageScore: Math.round(averages.avgScore),
        averageAccuracy: Math.round(averages.avgAccuracy),
        averageFluency: Math.round(averages.avgFluency),
        averagePronunciation: Math.round(averages.avgPronunciation),
        bestScore: bestScore?.score || 0,
        recentPractices,
        practicesByLevel: practiceByLevel.map((item) => ({
          level: item._id,
          count: item.count,
          avgScore: Math.round(item.avgScore),
        })),
      },
    });
  } catch (error) {
    console.error("Get user statistics error:", error);
    res.status(500).json({
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
}

// Get practice history for specific phrase
async function getPhrasePracticeHistory(req, res) {
  try {
    const { phraseId } = req.params;

    const practices = await PracticeHistory.find({
      user: req.user._id,
      phrase: phraseId,
    })
      .sort({ createdAt: -1 })
      .populate("phrase", "text language level");

    res.status(200).json({
      success: true,
      practices,
      totalAttempts: practices.length,
      bestScore:
        practices.length > 0 ? Math.max(...practices.map((p) => p.score)) : 0,
    });
  } catch (error) {
    console.error("Get phrase practice history error:", error);
    res.status(500).json({
      message: "Failed to fetch phrase practice history",
      error: error.message,
    });
  }
}

// Helper function to update user streak
async function updateUserStreak(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastPractice = await PracticeHistory.findOne({ user: userId })
      .sort({
        createdAt: -1,
      })
      .skip(1);

    if (!lastPractice) {
      // First practice ever
      user.streak = 1;
    } else {
      const lastPracticeDate = new Date(lastPractice.createdAt);

      const daysDiff = Math.floor(
        (today - lastPracticeDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        return;
      } else if (daysDiff === 1) {
        // consecutive day
        user.streak += 1;
      } else {
        // streak broken
        user.streak = 1;
      }
    }
    await user.save();
  } catch (error) {
    console.log("Update streak error.", error);
  }
}

module.exports = {
  savePracticeResult,
  getUserPracticeHistory,
  getUserStatistics,
  getPhrasePracticeHistory,
};
