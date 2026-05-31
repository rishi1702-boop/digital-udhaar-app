const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new store owner
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, storeName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({ name, email, password, storeName, phone });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        storeName: user.storeName,
        phone: user.phone,
        upiId: user.upiId || '',
        language: user.language || 'en',
        profileImage: user.profileImage || '',
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login store owner
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        storeName: user.storeName,
        phone: user.phone,
        upiId: user.upiId || '',
        language: user.language || 'en',
        profileImage: user.profileImage || '',
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, storeName, phone, upiId, language, password } = req.body;
    
    // Fetch user with password field
    const currentUser = await User.findById(req.user._id).select('+password');
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Security Check: If UPI ID is being updated, verify password
    if (upiId !== undefined && upiId !== currentUser.upiId) {
      if (!password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Password verification is required to update UPI ID' 
        });
      }

      const isMatch = await currentUser.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Incorrect password provided for verification' 
        });
      }
    }

    // Update fields
    if (name) currentUser.name = name;
    if (storeName) currentUser.storeName = storeName;
    if (phone !== undefined) currentUser.phone = phone;
    if (upiId !== undefined) currentUser.upiId = upiId;
    if (language) currentUser.language = language;
    
    // If a new image was uploaded to Cloudinary, save the URL
    if (req.file) {
      currentUser.profileImage = req.file.path;
    }

    await currentUser.save();

    res.status(200).json({
      success: true,
      data: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        storeName: currentUser.storeName,
        phone: currentUser.phone,
        upiId: currentUser.upiId,
        language: currentUser.language,
        profileImage: currentUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
