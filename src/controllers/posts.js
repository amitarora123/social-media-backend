const {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  updatePost,
  searchPosts,
  deletePostPermanentlty,
  getDeletedPostsByUserId,
  recoverDeletedPost,
  increaseView,
  getPostViews,
} = require("../models/post.js");

const logger = require("../utils/logger");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary.js");
const { getPostLikes } = require("../models/like.js");
const { getPostComments } = require("../models/comment.js");

const validMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/ogg",
];

/**
 * Create a new post
 */
const createPostController = async (req, res) => {
  try {
    const { content, comments_enabled } = req.validatedData;
    const userId = req.user.id;

    let imageUrl = null;
    if (req.file) {
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const localFilePath = req.file.path;
      imageUrl = await uploadOnCloudinary(localFilePath);
    }

    const post = await createPost({
      user_id: userId,
      content,
      media_url: imageUrl?.url,
      comments_enabled,
      schedule_at: null,
    });

    logger.verbose(`User ${userId} created post ${post.id}`);

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    logger.critical("Create post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const schedulePostController = async (req, res) => {
  try {
    const { content, comments_enabled, schedule_at } = req.validatedData;
    const userId = req.user.id;

    let imageUrl = null;
    if (req.file) {
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const localFilePath = req.file.path;
      imageUrl = await uploadOnCloudinary(localFilePath);
    }

    const post = await createPost({
      user_id: userId,
      content,
      media_url: imageUrl?.url,
      comments_enabled,
      scheduled_at: schedule_at,
    });

    logger.verbose(`User ${userId} created post ${post.id}`);

    res.status(201).json({
      message: "Post scheduled successfully",
      post,
    });
  } catch (error) {
    logger.critical("Schedule post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single post by ID
 */
const getPostByIdController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await getPostById(parseInt(post_id));

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    logger.critical("Get post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts by a specific user
 */
const getUserPostsController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(parseInt(user_id), limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user's posts
 */
const getMyPostsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get my posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getMyDeletedPostsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getDeletedPostsByUserId(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get my posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a post
 */
const deletePostPermanentlyController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const post = await getPostById(post_id);

    if (post) {
      await deleteFromCloudinary(post.media_url);
    }
    const success = await deletePostPermanentlty(parseInt(post_id), userId);

    console.log("success ", success);
    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted post ${post_id}`);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.critical("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const recoverRemovedPostController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await recoverDeletedPost(parseInt(post_id), userId);

    console.log("success ", success);

    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted post ${post_id}`);
    res.json({ message: "Post recovered successfully" });
  } catch (error) {
    logger.critical("recover post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const removePostController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await deletePost(parseInt(post_id), userId);

    console.log("success ", success);
    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted post ${post_id}`);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.critical("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get feed posts from followed users
 */
const getFeedPostsController = async (req, res) => {
  try {
    console.log("inside the getFeedPosts controller");
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getFeedPosts(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get feed posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a post
 */
const updatePostController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;
    const { content, comments_enabled } = req.body;
    let media_url = null;

    if (req.file) {
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const localFilePath = req.file.path;
      const post = await getPostById(post_id);
      await deleteFromCloudinary(post.media_url);
      media_url = await uploadOnCloudinary(localFilePath);
    }
    const updated = await updatePost(parseInt(post_id), {
      user_id: userId,
      content,
      media_url: media_url?.url,
      comments_enabled,
    });

    if (!updated) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    res.json({ message: "Post updated successfully" });
  } catch (error) {
    logger.critical("Update post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Search posts by content
 */
const searchPostsController = async (req, res) => {
  try {
    const { query: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const posts = await searchPosts(searchQuery, limit, offset);
    res.json({ posts });
  } catch (error) {
    logger.critical("Search posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const increaseViewController = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;
    await increaseView(parseInt(post_id), userId);

    return res.status(200).json({
      message: "View increased successfully",
    });
  } catch (error) {
    logger.critical("views increase error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPostStatsController = async (req, res) => {
  try {
    const { post_id } = req.params;

    const likes = await getPostLikes(parseInt(post_id));
    const views = await getPostViews(parseInt(post_id));
    const comments = await getPostComments(parseInt(post_id));

    return res.status(200).json({
      totalLikes: likes.length,
      totalViews: views.length,
      totalComments: comments.length,
    });
  } catch (error) {
    logger.critical("post stats error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createPostController,
  getPostByIdController,
  getUserPostsController,
  getMyPostsController,
  removePostController,
  getFeedPostsController,
  updatePostController,
  searchPostsController,
  deletePostPermanentlyController,
  getMyDeletedPostsController,
  recoverRemovedPostController,
  increaseViewController,
  getPostStatsController,
  schedulePostController,
};
