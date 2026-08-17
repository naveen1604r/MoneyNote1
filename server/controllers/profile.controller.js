const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

/**
 * GET /api/profile
 * Get authenticated user profile details
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, avatar_url, onboarding_completed, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const u = rows[0];
    return res.status(200).json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        avatarUrl: u.avatar_url || null,
        onboardingCompleted: !!u.onboarding_completed,
        createdAt: new Date(u.created_at).toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('[GetProfile Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
};

/**
 * PUT /api/profile
 * Update user profile details (Name, Phone, Avatar)
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, avatarUrl } = req.body;

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required and must be between 2 and 100 characters',
      });
    }

    const pool = getPool();
    const cleanedPhone = phone ? phone.trim() : null;
    const cleanedAvatar = avatarUrl ? avatarUrl.trim() : null;

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, avatar_url = ? WHERE id = ?',
      [name.trim(), cleanedPhone, cleanedAvatar, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('[UpdateProfile Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
};

/**
 * POST /api/profile/complete-onboarding
 * Mark first-time user onboarding flow as completed
 */
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    await pool.query('UPDATE users SET onboarding_completed = TRUE WHERE id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Onboarding marked as completed',
    });
  } catch (error) {
    console.error('[CompleteOnboarding Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update onboarding status.',
    });
  }
};

/**
 * POST /api/profile/change-password
 * Change user password securely
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('[ChangePassword Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
    });
  }
};

/**
 * DELETE /api/profile/account
 * Delete user account and cascade delete all associated data
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete account',
      });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password verification failed. Incorrect password.',
      });
    }

    // Cascade delete user
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Account and all associated financial data permanently deleted',
    });
  } catch (error) {
    console.error('[DeleteAccount Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account.',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  completeOnboarding,
  changePassword,
  deleteAccount,
};
