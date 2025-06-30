const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

// Create a comment
const createComment = async ({ userId, postId, content }) => {
  const result = await query(
    `INSERT INTO comments (user_id, post_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, postId, content]
  );
  return result.rows[0];
};

// Update a comment
const updateComment = async (commentId, userId, content) => {
  const result = await query(
    `UPDATE comments
     SET content = COALESCE($1, content),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [content, commentId, userId]
  );
  return result.rows[0];
};

// Delete a comment
const deleteComment = async (commentId, userId) => {
  const result = await query(
    `DELETE FROM comments
     WHERE id = $1 AND user_id = $2`,
    [commentId, userId]
  );
  return result;
};

// Get all comments for a post
const getPostComments = async (postId) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at DESC`,
    [postId]
  );
  return result.rows;
};

// Get a comment by its ID
const getCommentById = async (commentId) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [commentId]
  );
  return result.rows[0];
};


module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
};
