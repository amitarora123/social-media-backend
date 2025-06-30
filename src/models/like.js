const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

// Implemented likePost function
const likePost = async (userId, postId) => {
  const result = await query(
    `INSERT INTO likes (user_id, post_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, postId]
  );
  return { success: true };
};


// Implemented unlikePost function
const unlikePost = async (userId, postId) => {
  const result = await query(
    `DELETE FROM likes
     WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
  return { success: true };
};

// Implemented getPostLikes function
const getPostLikes = async (postId) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name
     FROM likes l
     JOIN users u ON l.user_id = u.id
     WHERE l.post_id = $1`,
    [postId]
  );
  return result.rows;
};


// Implemented getUserLikes function
const getUserLikes = async (userId) => {
  const result = await query(
    `SELECT p.*
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     WHERE l.user_id = $1`,
    [userId]
  );
  return result.rows;
};


// Implemented hasUserLikedPost function
const hasUserLikedPost = async (userId, postId) => {
  const result = await query(
    `SELECT 1 FROM likes
     WHERE user_id = $1 AND post_id = $2
     LIMIT 1`,
    [userId, postId]
  );
  return result.rowCount > 0;
};


module.exports = {
	likePost,
	unlikePost,
	getPostLikes,
	getUserLikes,
	hasUserLikedPost
};
