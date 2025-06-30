const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  likePostController,
  unlikePostController,
  getPostLikesController,
  getUserLikedPostsController,
  toggleLikeController,
  hasUserLikedPostController,
} = require("../controllers/likes.js");

const router = express.Router();

/**
 * Likes routes
 */

router.get("/:post_id", authenticateToken, hasUserLikedPostController);
router.post("/toggle/:post_id", authenticateToken, toggleLikeController);
router.post("/:post_id", authenticateToken, likePostController);
router.delete("/:post_id", authenticateToken, unlikePostController);
router.get("/post/:post_id", getPostLikesController);
router.get("/user/:user_id", getUserLikedPostsController);

module.exports = router;
