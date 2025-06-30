const express = require("express");
const {
  validateRequest,
  createPostSchema,
  updatePostSchema,
  schedulePostSchema,
} = require("../utils/validation");
const {
  createPostController,
  getPostByIdController,
  getUserPostsController,
  getMyPostsController,
  removePostController,
  getFeedPostsController,
  updatePostController,
  deletePostPermanentlyController,
  recoverRemovedPostController,
  searchPostsController,
  increaseViewController,
  getPostStatsController,
  schedulePostController,
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/multer");

const router = express.Router();

/**
 * Posts routes
 */

// POST /api/posts - Create a new post

router
  .route("/")
  .post(
    authenticateToken,
    upload.single("media"),
    validateRequest(createPostSchema),
    createPostController
  );

router
  .route("/schedule")
  .post(
    authenticateToken,
    upload.single("media"),
    validateRequest(schedulePostSchema),
    schedulePostController
  );

// GET /api/posts/my - Get current user's posts
router.get("/my", authenticateToken, getMyPostsController);

// Get posts from followed users (Feed)
router.get("/feed", authenticateToken, getFeedPostsController);

// GET /api/posts/search - Get a posts by content
router.get("/search", searchPostsController);

// GET /api/posts/:post_id - Get a single post by ID
router.get("/:post_id", optionalAuth, getPostByIdController);

// GET /api/posts/user/:user_id - Get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPostsController);

// DELETE /api/posts/:post_id - Delete a post
router.delete("/:post_id", authenticateToken, removePostController);

// DELETE /api/posts/:post_id - Delete a post
router.put(
  "/recover/:post_id",
  authenticateToken,
  recoverRemovedPostController
);

// DELETE /api/posts/permanent/:post_id - Delete a post
router.delete(
  "/permanent/:post_id",
  authenticateToken,
  deletePostPermanentlyController
);

// Update a post
router
  .route("/:post_id")
  .put(
    authenticateToken,
    upload.single("media"),
    validateRequest(updatePostSchema),
    updatePostController
  );
router.post(
  "/:post_id/increase-view",
  authenticateToken,
  increaseViewController
);

router.get("/stats/:post_id", getPostStatsController);

module.exports = router;
