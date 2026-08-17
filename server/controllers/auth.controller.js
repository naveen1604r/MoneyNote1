const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Helper: Email validation
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validations
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const pool = getPool();

    // 2. Check duplicate email
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'This email address is already registered' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const userId = result.insertId;

    // 5. Generate JWT token
    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim() }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        avatarUrl: null,
        onboardingCompleted: false,
      },
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password' });
    }

    const pool = getPool();

    // 1. Fetch user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    const user = users[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    // 3. Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatarUrl: user.avatar_url || null,
        onboardingCompleted: !!user.onboarding_completed,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
};

/**
 * GET /api/auth/me
 * Protected endpoint
 */
const getMe = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, name, email, phone, avatar_url AS avatarUrl, onboarding_completed AS onboardingCompleted, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const u = users[0];
    return res.status(200).json({
      success: true,
      user: {
        ...u,
        onboardingCompleted: !!u.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
