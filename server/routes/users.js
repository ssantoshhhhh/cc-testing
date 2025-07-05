const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, email, phone, address } = req.body;
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/orders
// @desc    Get user order history
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      },
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/orders/active
// @desc    Get user active rentals
// @access  Private
router.get('/orders/active', protect, async (req, res) => {
  try {
    const activeOrders = await Order.find({
      user: req.user.id,
      status: { $in: ['confirmed', 'rented'] }
    })
    .populate('items.product')
    .sort({ expectedReturnDate: 1 });

    res.json({
      success: true,
      count: activeOrders.length,
      data: activeOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/orders/overdue
// @desc    Get user overdue rentals
// @access  Private
router.get('/orders/overdue', protect, async (req, res) => {
  try {
    const overdueOrders = await Order.find({
      user: req.user.id,
      status: { $in: ['confirmed', 'rented'] },
      expectedReturnDate: { $lt: new Date() }
    })
    .populate('items.product')
    .sort({ expectedReturnDate: 1 });

    res.json({
      success: true,
      count: overdueOrders.length,
      data: overdueOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get order statistics
    const stats = await Order.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPenalty: { $sum: '$penaltyAmount' },
          activeRentals: {
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'rented']] },
                1,
                0
              ]
            }
          },
          overdueRentals: {
            $sum: {
              $cond: [
                { $and: [
                  { $in: ['$status', ['confirmed', 'rented']] },
                  { $gt: [new Date(), '$expectedReturnDate'] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get active rentals
    const activeRentals = await Order.find({
      user: req.user.id,
      status: { $in: ['confirmed', 'rented'] }
    })
    .populate('items.product')
    .sort({ expectedReturnDate: 1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          totalPenalty: 0,
          activeRentals: 0,
          overdueRentals: 0
        },
        recentOrders,
        activeRentals
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/cart
// @desc    Get current user's cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/cart
// @desc    Update current user's cart
// @access  Private
router.post('/cart', protect, async (req, res) => {
  try {
    const { cart } = req.body;
    console.log('Received cart data:', cart);
    
    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: 'Cart must be an array' });
    }
    
    // Validate each cart item
    for (const item of cart) {
      if (!item.product || typeof item.product !== 'string') {
        console.error('Invalid cart item: missing or invalid product', item);
        return res.status(400).json({ message: 'Each cart item must have a valid product ID.' });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        console.error('Invalid cart item: missing or invalid quantity', item);
        return res.status(400).json({ message: 'Each cart item must have a valid quantity.' });
      }
      if (!item.rentalDays || typeof item.rentalDays !== 'number' || item.rentalDays < 1) {
        console.error('Invalid cart item: missing or invalid rentalDays', item);
        return res.status(400).json({ message: 'Each cart item must have a valid rentalDays.' });
      }
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert cart items to the format expected by the User model
    const cartItems = cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      rentalDays: item.rentalDays
    }));
    
    user.cart = cartItems;
    await user.save();
    
    // Return the populated cart
    const populatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, cart: populatedUser.cart });
  } catch (error) {
    console.error('Error in POST /api/users/cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 