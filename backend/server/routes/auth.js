const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, role = 'buyer' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // DEBUG: Checking user role for OTP bypass
    console.log(`Login attempt for ${user.email} with role: ${user.role}`);

    // Bypassing OTP for Admin role
    if (user.role === 'admin' || user.email === 'admin@test.com') {
      console.log('Bypassing OTP for admin');
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Admin login successful',
        verificationRequired: false,
        data: {
          user,
          token
        }
      });
    }

    // Generate OTP for login verification for everyone else
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    user.otpType = 'login';
    await user.save();

    // Send OTP via email
    const emailOptions = {
      email: user.email,
      subject: 'Login Verification Code - Sweet Delights',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff69b4;">Login Verification</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your verification code for Sweet Delights is:</p>
          <h1 style="background: #f9f9f9; padding: 10px; text-align: center; border-radius: 5px; color: #333; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">Sweet Delights Marketplace Team</p>
        </div>
      `,
      text: `Your login verification code is: ${otp}. It will expire in 10 minutes.`
    };

    await sendEmail(emailOptions);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      verificationRequired: true,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return token
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email, 
      otpCode: otp,
      otpExpiry: { $gt: Date.now() },
      otpType: 'login'
    }).select('+otpCode +otpExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Clear OTP fields after successful verification
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    if (user.otpType === 'login') {
      user.emailVerified = true; // Mark as verified if login OTP is successful
    }
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Verification successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('OTP Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for login
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    user.otpType = 'login';
    await user.save();

    // Send OTP via email
    const emailOptions = {
      email: user.email,
      subject: 'Resent Verification Code - Sweet Delights',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff69b4;">Login Verification</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your new verification code for Sweet Delights is:</p>
          <h1 style="background: #f9f9f9; padding: 10px; text-align: center; border-radius: 5px; color: #333; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">Sweet Delights Marketplace Team</p>
        </div>
      `,
      text: `Your new login verification code is: ${otp}. It will expire in 10 minutes.`
    };

    await sendEmail(emailOptions);

    res.json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending code'
    });
  }
});
 
// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ff69b4;">Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #ff69b4; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777;">Sweet Delights Marketplace Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - Sweet Delights',
        html: message,
        text: `You requested a password reset. Please go to: ${resetUrl}`
      });

      res.json({
        success: true,
        message: 'Email sent successfully'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/google-sync
// @desc    Sync Google user with MongoDB
// @access  Public
router.post('/google-sync', async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'buyer' } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        role,
        isGoogleUser: true,
        password: Math.random().toString(36).slice(-10) // Temporary password for internal logic
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('Google sync error:', error);
    res.status(500).json({ success: false, message: 'Server error during sync' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phone').optional().trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'profileImage', 'sellerInfo', 'email'];
    const updates = {};
    let emailChanged = false;

    // Only allow specified fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'email' && req.body[key] !== req.user.email) {
          emailChanged = true;
        }
        updates[key] = req.body[key];
      }
    });

    if (emailChanged) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      updates.otpCode = otp;
      updates.otpExpiry = otpExpiry;
      updates.otpType = 'email_verification';
      updates.emailVerified = false;

      // Send OTP to new email
      await sendEmail({
        email: updates.email,
        subject: 'Verify Your New Email - Sweet Delights',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff69b4;">Email Change Verification</h2>
            <p>You have requested to change your email to ${updates.email}.</p>
            <p>Your verification code is:</p>
            <h1 style="background: #f9f9f9; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 15 minutes.</p>
          </div>
        `,
        text: `Your email verification code is: ${otp}`
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: emailChanged ? 'Profile updated. Please verify your new email.' : 'Profile updated successfully',
      emailChangePending: emailChanged,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/verify-email-change
// @desc    Verify OTP for email change
// @access  Private
router.post('/verify-email-change', [
  auth,
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findOne({
      _id: req.user._id,
      otpCode: otp,
      otpExpiry: { $gt: Date.now() },
      otpType: 'email_verification'
    }).select('+otpCode +otpExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    user.emailVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: user
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/bank-details
// @desc    Update seller bank details
// @access  Private (Seller only)
router.put('/bank-details', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bankDetails: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private (Admin only)
const { authorize } = require('../middleware/auth');
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/auth/users/:id/status
// @desc    Toggle user status
// @access  Private (Admin only)
router.patch('/users/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/analytics/users
// @desc    Get user growth analytics
// @access  Private (Admin only)
router.get('/analytics/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 } // Last 30 days
    ]);

    // Map to recharts format
    const data = users.map(u => ({
      date: u._id,
      users: u.count
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;