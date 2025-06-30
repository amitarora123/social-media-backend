const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
} = require("../models/follow.js");
const { findUsersByName, getAccountStats } = require("../models/user.js");
// Follow a user
const follow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { user_id: followingId } = req.body;

    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    await followUser(followerId, followingId);
    res.status(200).json({ message: "User followed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error while following user." });
  }
};

// Unfollow a user
const unfollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { user_id: followingId } = req.body;

    await unfollowUser(followerId, followingId);
    res.status(200).json({ message: "User unfollowed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error while unfollowing user." });
  }
};

// Get users the current user is following
const getMyFollowing = async (req, res) => {
  try {
    const result = await getFollowing(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting following users." });
  }
};

// Get users who follow the current user
const getMyFollowers = async (req, res) => {
  try {
    const result = await getFollowers(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting followers." });
  }
};

// Get follow stats
const getStats = async (req, res) => {
  try {
    const stats = await getFollowCounts(req.user.id);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Error getting follow stats." });
  }
};

// Find users by name (search)
const searchUsers = async (req, res) => {
  try {
    const { name, page, limit } = req.body;
    const result = await findUsersByName(name, limit, page);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error searching users." });
  }
};

const getAccountStatsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getAccountStats(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.stats(200).json({ message: "Error fetching stats" });
  }
};

module.exports = {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getStats,
  searchUsers,
  getAccountStatsController,
};
