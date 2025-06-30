const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getStats,
  searchUsers,
  getAccountStatsController,
} = require("../controllers/users");

const router = express.Router();

/**
 * User-related routes
 */

// Follow a user
router.post("/follow", authenticateToken, follow);

// Unfollow a user
router.delete("/unfollow", authenticateToken, unfollow);

// Get users that current user follows
router.get("/following", authenticateToken, getMyFollowing);

// Get users that follow the current user
router.get("/followers", authenticateToken, getMyFollowers);

// Get follow stats for current user
router.get("/stats", authenticateToken, getStats);

// Find users by name (with partial matching & pagination)
router.post("/search", authenticateToken, searchUsers);

router.get("/account-stats", authenticateToken, getAccountStatsController);

module.exports = router;
