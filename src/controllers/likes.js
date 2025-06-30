const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
} = require("../models/like.js");
const logger = require("../utils/logger");

/**
 * Toggle Like for a post
 */

const toggleLikeController = async (req, res) => {
  try {
    try {
      const userId = req.user.id;
      const { post_id } = req.params;

      const hasLiked = await hasUserLikedPost(userId, parseInt(post_id));

      console.log("hasLiked: ", hasLiked);

      if (hasLiked) {
        await unlikePost(userId, post_id);
        logger.verbose(`User ${userId}  unliked for a post ${post_id}`);
        res.status(201).json({ message: "post unliked successfully" });
      } else {
        await likePost(userId, parseInt(post_id));
        logger.verbose(`User ${userId} liked a post ${post_id}`);
        res.status(201).json({ message: "post liked successfully" });
      }
    } catch (error) {
      logger.critical("toggleLike post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {}
};

/**
 * Like a post
 */
const likePostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.params;

    await likePost(userId, parseInt(post_id));
    logger.verbose(`User ${userId} liked post ${post_id}`);

    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    logger.critical("Like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unlike a post
 */
const unlikePostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.params;

    await unlikePost(userId, parseInt(post_id));
    logger.verbose(`User ${userId} unliked post ${post_id}`);

    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get likes for a post
 */
const getPostLikesController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const likes = await getPostLikes(parseInt(post_id));
    res.json({ likes });
  } catch (error) {
    logger.critical("Get post likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts liked by a user
 */
const getUserLikedPostsController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const likedPosts = await getUserLikes(parseInt(user_id));
    res.json({ posts: likedPosts });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const hasUserLikedPostController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const result = await hasUserLikedPost(userId, parseInt(post_id));

    return res.status(200).json({
      message: "like status fetched successfully",
      data: result,
    });
  } catch (error) {
    logger.critical("hasUserLikedPost error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  likePostController,
  unlikePostController,
  getPostLikesController,
  getUserLikedPostsController,
  toggleLikeController,
  hasUserLikedPostController,
};
