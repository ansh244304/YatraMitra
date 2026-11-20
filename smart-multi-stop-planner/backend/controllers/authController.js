
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { auth, makeToken } from '../middleware/auth.js';

// Send user details and token
function sendToken(res, user, status = 200) {
  const token = makeToken(user);

  res.status(status).json({
    message: 'Success',
    accessToken: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

// Register user
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });

    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    sendToken(res, user, 201);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Login user
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendToken(res, user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get logged-in user
export function me(req, res) {
  res.json({ user: req.user });
}

// Update profile
export async function updateProfile(req, res) {
  try {
    const { name, avatar } = req.body;

    if (name) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;

    await req.user.save();

    res.json({ message: 'Profile updated', user: req.user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Change password
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Wrong current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Forgot password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.json({ message: 'If email exists, reset token was created' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetExpires = Date.now() + 30 * 60 * 1000;

    await user.save();

    res.json({ message: 'Reset token created', resetToken: token });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetExpires = null;

    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { auth };
