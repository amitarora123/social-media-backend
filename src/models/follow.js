const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

// Follow a user
const followUser = async (followerId, followingId) => {
  await query(
    `INSERT INTO follows (follower_id, following_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [followerId, followingId]
  );
};

// Unfollow a user
const unfollowUser = async (followerId, followingId) => {
  await query(
    `DELETE FROM follows
     WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
};

// Get all users the current user is following
const getFollowing = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1`,
    [userId]
  );
  return result.rows;
};

// Get all followers of the current user
const getFollowers = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1`,
    [userId]
  );
  return result.rows;
};

// Get follower and following counts
const getFollowCounts = async (userId) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following_count,
       (SELECT COUNT(*) FROM follows WHERE following_id = $1) AS follower_count`,
    [userId]
  );
  return result.rows[0];
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
};
