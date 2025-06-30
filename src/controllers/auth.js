const {
  createUser,
  getUserByUsername,
  verifyPassword,
  getUserByEmail,
} = require("../models/user");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.validatedData;

    // Create user

    const existingUserByUsername = await getUserByUsername(username);
    const existingUserByEmail = await getUserByEmail(email);

    
    if (existingUserByUsername) {
      return res.status(400).json({
        message: "Username already exist",
      });
    }

    if (existingUserByEmail) {
      return res.status(400).json({
        message: "Email already exist",
      });
    }

    const user = await createUser({ username, email, password, full_name });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    logger.verbose(`New user registered: ${username}`);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    logger.critical("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.validatedData;

    // Find user
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    logger.verbose(`User logged in: ${username}`);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only secure in prod // use only with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
        },
        token,
      });
  } catch (error) {
    logger.critical("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.critical("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
