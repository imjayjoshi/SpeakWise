const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const practiceHistoryController = require("../controllers/practiceHistory.controller");
const router = express.Router();

// save practice result
router.post(
  "/save",
  authUser,
  practiceHistoryController.savePracticeResult
);

// Alias route for frontend compatibility - save practice result with phraseId in URL
router.post(
  "/practice/:phraseId",
  authUser,
  practiceHistoryController.savePracticeResult
);

// get User's practice History
router.get(
  "/user",
  authUser,
  practiceHistoryController.getUserPracticeHistory
);

// Alias route for frontend compatibility - get practice history
router.get(
  "/history",
  authUser,
  practiceHistoryController.getUserPracticeHistory
);

// get User statistics
router.get(
  "/stats",
  authUser,
  practiceHistoryController.getUserStatistics
);

// Alias route for frontend compatibility - get user statistics
router.get(
  "/statistics",
  authUser,
  practiceHistoryController.getUserStatistics
);

// get practice history for specific phrase
router.get(
  "/phrase/:phraseId",
  authUser,
  practiceHistoryController.getPhrasePracticeHistory
);

module.exports = router;
