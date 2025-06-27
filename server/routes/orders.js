const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  protect,
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('rentalDays').isInt({ min: 1 }).withMessage('Rental days must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, rentalDays, notes } = req.body;
    let totalAmount = 0;
    const orderItems = [];

    // Validate each item and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      if (product.availableQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for ${product.name}. Available: ${product.availableQuantity}` 
        });
      }

      const itemTotal = product.pricePerDay * item.quantity * rentalDays;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        pricePerDay: product.pricePerDay,
        totalPrice: itemTotal
      });

      // Update product availability
      product.availableQuantity -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      rentalDays,
      notes
    });

    await order.populate('items.product');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
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

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email studentId department');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/return
// @desc    Return items
// @access  Private
router.put('/:id/return', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to return this order' });
    }

    if (order.status === 'returned') {
      return res.status(400).json({ message: 'Order already returned' });
    }

    // Calculate penalty if overdue
    let penaltyAmount = 0;
    let penaltyDays = 0;
    
    if (new Date() > order.expectedReturnDate) {
      penaltyDays = Math.ceil((new Date() - order.expectedReturnDate) / (1000 * 60 * 60 * 24));
      penaltyAmount = penaltyDays * 50; // $50 per day penalty
    }

    // Update order
    order.status = 'returned';
    order.actualReturnDate = new Date();
    order.penaltyAmount = penaltyAmount;
    order.penaltyDays = penaltyDays;

    // Return items to inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.availableQuantity += item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      data: order,
      penalty: {
        days: penaltyDays,
        amount: penaltyAmount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', [
  protect,
  authorize('admin'),
  body('status').isIn(['pending', 'confirmed', 'rented', 'returned', 'overdue', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/overdue/check
// @desc    Check for overdue orders
// @access  Private
router.get('/overdue/check', protect, async (req, res) => {
  try {
    const overdueOrders = await Order.find({
      user: req.user.id,
      status: { $in: ['confirmed', 'rented'] },
      expectedReturnDate: { $lt: new Date() }
    }).populate('items.product');

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

// @route   GET /api/orders/stats/user
// @desc    Get user order statistics
// @access  Private
router.get('/stats/user', protect, async (req, res) => {
  try {
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

    res.json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        totalPenalty: 0,
        activeRentals: 0,
        overdueRentals: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 