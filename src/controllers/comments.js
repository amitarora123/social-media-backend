const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
} = require("../models/comment.js");

const logger = require("../utils/logger");

/**
 * Create a comment on a post
 */
const create = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await createComment({
      userId: userId,
      postId: parseInt(post_id),
      content,
    });

    logger.verbose(`User ${userId} commented on post ${post_id}`);
    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a user's own comment
 */
const update = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const updated = await updateComment(parseInt(comment_id), userId, content);
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} updated comment ${comment_id}`);
    res.json({ message: "Comment updated successfully" });
  } catch (error) {
    logger.critical("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a user's own comment
 */
const remove = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const userId = req.user.id;

    const success = await deleteComment(parseInt(comment_id), userId);
    if (!success) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted comment ${comment_id}`);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get comments for a post with pagination
 */
const getByPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const comments = await getPostComments(parseInt(post_id), limit, offset);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  update,
  remove,
  getByPost,
};
