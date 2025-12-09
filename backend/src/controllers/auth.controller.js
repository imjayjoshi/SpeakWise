const express = require("express");
const cookieParser = require("cookie-parser");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email address" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role
    const role = email === "admin@gmail.com" ? "admin" : "learner";

    // Create user
    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      role: role,
      streak: 0,
      lastLogin: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}


async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // FIXED STREAK LOGIC
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight

    // Get last login and reset to midnight for comparison
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    // Calculate difference in days
    const diffInMs = today - lastLogin;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (!lastLogin) {
      // First time login
      user.streak = 1;
    } else if (diffInDays === 0) {
      // Same day login - no change
    } else if (diffInDays === 1) {
      // Consecutive day - increase streak
      user.streak += 1;
    } else if (diffInDays > 1) {
      // Streak broken - reset to 1
      user.streak = 1;
    }

    // Update last login to current date
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout Successful" });
}

async function getLoggedInUser(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        streak: user.streak,
        badges: user.badges,
        role: user.role,
        phone: user.phone,
        languageLevel: user.languageLevel,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, phone, languageLevel } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (languageLevel) updateData.languageLevel = languageLevel;

    const user = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        streak: user.streak,
        badges: user.badges,
        role: user.role,
        languageLevel: user.languageLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
}

async function updatePassword(req, res) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password", error: error.message });
  }
}

// Direct password reset (no email verification)
async function requestPasswordReset(req, res) {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required"
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Validate password strength
    const { validatePassword } = require('../utils/passwordValidator');
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: validation.errors
      });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Clear any existing reset tokens
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
}

// Reset password with token
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate password
    const { validatePassword } = require('../utils/passwordValidator');
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: validation.errors
      });
    }

    // Hash the token from URL
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getLoggedInUser,
  updateProfile,
  updatePassword,
  requestPasswordReset,
  resetPassword,
};
