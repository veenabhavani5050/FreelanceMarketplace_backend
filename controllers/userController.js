import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Basic info updates
  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;

  // Update role-specific profile fields
  if (user.role === "freelancer") {
    user.profile.skills = req.body.skills ?? user.profile.skills;
    user.profile.portfolio = req.body.portfolio ?? user.profile.portfolio;
    user.profile.availability = req.body.availability ?? user.profile.availability;
  } else if (user.role === "client") {
    user.profile.companyName = req.body.companyName ?? user.profile.companyName;
    user.profile.businessDetails = req.body.businessDetails ?? user.profile.businessDetails;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profile: updatedUser.profile,
  });
});
