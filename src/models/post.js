const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
  scheduled_at,
}) => {
  const is_published = !scheduled_at || new Date(scheduled_at) <= new Date();
  console.log("schedule at: ", scheduled_at);
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, scheduled_at, is_published, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), false)
     RETURNING id, user_id, content, media_url, comments_enabled, scheduled_at, is_published, created_at`,
    [user_id, content, media_url, comments_enabled, scheduled_at, is_published]
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId, viewerId = null) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1
       AND (p.is_published = true OR p.user_id = $2)
       AND p.is_deleted = false`,
    [postId, viewerId]
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
     AND p.is_deleted = false
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

const getDeletedPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
     AND p.is_deleted = true
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = true WHERE id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rowCount > 0;
};
const recoverDeletedPost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = false WHERE id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rowCount > 0;
};

const deletePostPermanentlty = async (postId, userId) => {
  const result = await query(
    `DELETE FROM posts 
    WHERE id = $1 AND user_id = $2
    `,
    [postId, userId]
  );
  return result.rowCount > 0;
};

// Implemented getFeedPosts function that returns posts from followed users
// This includes pagination and ordering by creation date
const getFeedPosts = async (userId, limit = 10, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM follows f
     JOIN posts p ON f.following_id = p.user_id
     JOIN users u ON p.user_id = u.id
     WHERE f.follower_id = $1
       AND p.is_published = true
       AND p.is_deleted = false
       AND (p.scheduled_at IS NULL OR p.scheduled_at <= NOW())
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

// Implemented updatePost function for editing posts
const updatePost = async (
  postId,
  { user_id, content, media_url, comments_enabled, scheduled_at }
) => {
  const is_published = !scheduled_at || new Date(scheduled_at) <= new Date();

  const result = await query(
    `UPDATE posts
     SET 
       content = COALESCE($1, content),
       media_url = COALESCE($2, media_url),
       comments_enabled = COALESCE($3, comments_enabled),
       scheduled_at = COALESCE($4, scheduled_at),
       is_published = $5,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [
      content,
      media_url,
      comments_enabled,
      scheduled_at,
      is_published,
      postId,
      user_id,
    ]
  );

  return result.rows[0];
};

// Implemented searchPosts function for content search
const searchPosts = async (searchTerm, limit = 10, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.content ILIKE '%' || $1 || '%'
       AND p.is_published = true
       AND p.is_deleted = false
       AND (p.scheduled_at IS NULL OR p.scheduled_at <= NOW())
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [searchTerm, limit, offset]
  );

  return result.rows;
};

const increaseView = async (postId, userId) => {
  const result = await query(
    `INSERT INTO views (user_id, post_id)
    VALUES ($1, $2)
    RETURNING *`,
    [userId, postId]
  );

  return result.rows[0];
};

const getPostViews = async (postId) => {
  const result = await query(
    `SELECT * FROM views
    WHERE post_id = $1`,
    [postId]
  );

  return result.rows;
};

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  updatePost,
  searchPosts,
  getDeletedPostsByUserId,
  deletePostPermanentlty,
  recoverDeletedPost,
  increaseView,
  getPostViews,
};
