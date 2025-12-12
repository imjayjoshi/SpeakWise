const User = require("../models/user.model");
const PracticeHistory = require("../models/practiceHistory.model");
const Phrase = require("../models/phrase.model");

async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const searchQuery = search
      ? {
          $or: [
            { fulllName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalPractices = await PracticeHistory.countDocuments({
          user: user._id,
        });

        const avgScoreResult = await PracticeHistory.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: null,
              avgScore: { $avg: "$score" },
            },
          },
        ]);

        const avgScore = avgScoreResult[0]?.avgScore || 0;

        const lastPractice = await PracticeHistory.findOne({ user: user._id })
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          ...user.toObject(),
          statistics: {
            totalPractices,
            avgScore: Math.round(avgScore),
            lastPractice: lastPractice?.createdAt || null,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
}

async function getUserDetails(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalPractices = await PracticeHistory.countDocuments({
      user: userId,
    });

    const uniquePhrases = await PracticeHistory.distinct("phrase", {
      user: userId,
    });

    const avgResult = await PracticeHistory.aggregate([
      { $match: { user: user._id } },
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

    const bestScore = await PracticeHistory.findOne({ user: userId })
      .sort({
        score: -1,
      })
      .limit(1);

    const recentPractices = await PracticeHistory.find({
      user: userId,
    })
      .populate("phrase", "text language level")
      .sort({ createdAt: -1 })
      .limit(5);

    const practicesByLevel = await PracticeHistory.aggregate([
      {
        $match: { user: user._id },
      },
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

    const totalPhrasesAvailable = await Phrase.countDocuments();

    res.status(200).json({
      success: true,
      user: user.toObject(),
      statistics: {
        totalPractices,
        uniquePhrasesPracticed: uniquePhrases.length,
        totalPhrasesAvailable,
        averageScore: Math.round(averages.avgScore),
        averageAccuracy: Math.round(averages.avgAccuracy),
        averageFluency: Math.round(averages.avgFluency),
        averagePronunciation: Math.round(averages.avgPronunciation),
        bestScore: bestScore?.score || 0,
        practicesByLevel: practicesByLevel.map((item) => ({
          level: item._id,
          count: item.count,
          avgScore: Math.round(item.avgScore),
        })),
        recentPractices,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { fullName, email, role, streak } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        role,
        streak,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
}

async function updateUserPassword(req, res) {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    const { validatePassword } = require('../utils/passwordValidator');
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: validation.errors
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User password updated successfully",
    });
  } catch (error) {
    console.error("Update user password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    await PracticeHistory.deleteMany({ user: userId });

    const user = await User.findByIdAndDelete(userId);

    if (!userId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
}

async function getSystemStatistics(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ role: "learner" });
    const adminUsers = await User.countDocuments({ role: "admin" });

    const totalPhrases = await Phrase.countDocuments();
    const phrasesByLevel = await Phrase.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalPractices = await PracticeHistory.countDocuments();

    const avgSystemScore = await PracticeHistory.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
        },
      },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await PracticeHistory.distinct("user", {
      createdAt: { $gte: today },
    });

    const formattedPhrasesByLevel = phrasesByLevel.map(item => ({
      level: item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      totalUsers,
      activeUsers,
      totalPhrases,
      totalPractices,
      avgPronunciationScore: Math.round(avgSystemScore[0]?.avgScore || 0),
      phrasesByLevel: formattedPhrasesByLevel,
      newUsersLast30Days: recentUsers,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          recentSignups: recentUsers,
          activeToday: activeToday.length,
        },
        phrases: {
          total: totalPhrases,
          byLevel: phrasesByLevel,
        },
        practices: {
          total: totalPractices,
          averageScore: Math.round(avgSystemScore[0]?.avgScore || 0),
        },
      },
    });
  } catch (error) {
    console.error("Get system statistics error:", error);
    res.status(500).json({
      message: "Failed to fetch system statistics",
      error: error.message,
    });
  }
}

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUser,
  updateUserPassword,
  deleteUser,
  getSystemStatistics,
};
