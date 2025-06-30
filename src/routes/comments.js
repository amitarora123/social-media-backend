const express = require("express");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Controllers (You need to implement these functions)
const {
  create,
  update,
  remove,
  getByPost,
} = require("../controllers/comments.js");

// Create a comment on a post
router.post("/:post_id", authenticateToken, create);

// Update a comment
router.put("/:comment_id", authenticateToken, update);

// Delete a comment
router.delete("/:comment_id", authenticateToken, remove);

// Get comments for a specific post
router.get("/post/:post_id", getByPost);

module.exports = router;
