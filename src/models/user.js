const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name]
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

const getUserByEmail = async (email) => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Implemented findUsersByName function for search functionality
// This supports partial name matching and pagination
const findUsersByName = async (searchTerm, limit = 10, pageNo) => {
  const result = await query(
    `SELECT id, username, full_name
     FROM users
     WHERE full_name ILIKE '%' || $1 || '%'
     AND is_deleted = FALSE
     ORDER BY full_name ASC
     LIMIT $2 OFFSET $3`,
    [searchTerm, limit, (pageNo - 1) * limit]
  );

  return result.rows;
};

// Implemented getUserProfile function that includes follower/following counts
const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.email, u.created_at,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
     FROM users u
     WHERE u.id = $1 AND u.is_deleted = FALSE`,
    [userId]
  );

  return result.rows[0];
};

// Implemented updateUserProfile function for profile updates
const updateUserProfile = async (userId, { full_name, email }) => {
  const result = await query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND is_deleted = FALSE
     RETURNING id, username, full_name, email, updated_at`,
    [full_name, email, userId]
  );

  return result.rows[0];
};

const getAccountStats = async (userId) => {
  const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM posts WHERE user_id = $1) AS total_posts,
        (SELECT COUNT(*) FROM comments WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)) AS total_comments,
        (SELECT COUNT(*) FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)) AS total_likes,
        (SELECT COUNT(*) FROM views WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)) AS total_views,
        (SELECT COUNT(*) FROM follows WHERE following_id = $1) AS total_followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS total_following
    `;
  const result = await query(statsQuery, [userId]);
  return result.rows[0];
};
module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  updateUserProfile,
  getUserProfile,
  getUserByEmail,
  getAccountStats
};
