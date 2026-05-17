const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const sendEmail = require('../utils/email');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyer)
router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const productIds = items.map(item => item.product);
    const { Op } = require('sequelize');
    const products = await Product.findAll({ 
      where: { id: { [Op.in]: productIds } } 
    });
    
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Products not found' });
    }

    const sellerId = products[0].sellerId;
    const seller = await User.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    let total = 0;
    const orderItems = items.map(item => {
      const dbProduct = products.find(p => p.id === item.product);
      total += dbProduct.price * item.quantity;
      return {
        product: dbProduct.id,
        quantity: item.quantity,
        price: dbProduct.price
      };
    });

    const order = await Order.create({
      customerId: req.user.id,
      sellerId: sellerId,
      items: orderItems,
      subtotal: total,
      total: total,
      delivery: {
        address: deliveryAddress,
        scheduledDate: new Date(Date.now() + 86400000) // Default tomorrow
      },
      payment: {
        method: paymentMethod || 'cash_on_delivery'
      }
    });

    // Send Email to Seller
    const buyer = await User.findByPk(req.user.id);
    const emailOptions = {
      email: seller.email,
      subject: `New Order Received - ${order.orderNumber}`,
      text: `Hello ${seller.firstName},\n\nYou have received a new order (${order.orderNumber}) from ${buyer.firstName} ${buyer.lastName}.\nThe total amount is Rs${total.toFixed(2)}.\n\nPlease log in to your Seller Dashboard to Accept or Reject this order.\n\nDelivery Address: ${deliveryAddress.street}, ${deliveryAddress.city}\n\nBest,\nSweet Delights Team`
    };

    await sendEmail(emailOptions);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Seller)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body; 
    
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.sellerId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    // Send Email to Buyer
    const buyer = await User.findByPk(order.customerId);
    const seller = await User.findByPk(req.user.id);

    const isAccepted = status === 'confirmed';
    const emailSubject = isAccepted ? `Your Order ${order.orderNumber} is Accepted!` : `Your Order ${order.orderNumber} was Declined`;
    let emailText = `Hello ${buyer.firstName},\n\n`;
    if (isAccepted) {
      emailText += `Great news! ${seller.firstName} has accepted your order (${order.orderNumber}). They will begin preparing your cakes shortly!\n\n`;
    } else {
      emailText += `Unfortunately, ${seller.firstName} is unable to fulfill your order (${order.orderNumber}) at this time and it has been cancelled.\n\n`;
    }
    emailText += `Thank you for using Sweet Delights!`;

    await sendEmail({
      email: buyer.email,
      subject: emailSubject,
      text: emailText
    });

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/seller
// @desc    Get all orders for a seller
// @access  Private (Seller)
router.get('/seller', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { sellerId: req.user.id },
      include: [
        { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']] 
    });
    // Note: Items are currently JSON in Order model, so we might need manual mapping if we want to populate products inside items
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's order history
// @access  Private (Buyer)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { customerId: req.user.id },
      include: [
        { model: User, as: 'seller', attributes: ['firstName', 'lastName', 'sellerInfo'] }
      ],
      order: [['createdAt', 'DESC']] 
    });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/admin
// @desc    Get all orders (Admin only)
// @access  Private (Admin only)
const { authorize } = require('../middleware/auth');
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'seller', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/orders/admin/:id
// @desc    Hard delete an order (Admin only)
// @access  Private (Admin only)
router.delete('/admin/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.destroy();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order as admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Admin only)
router.get('/analytics/revenue', auth, authorize('admin'), async (req, res) => {
  try {
    // Revenue by category analytics
    const { sequelize } = require('../config/db');
    // This assumes items is a JSON array or we have a more complex structure
    // For now, a simplified version based on total and potentially parsing categories if possible
    // Or just group by status if category is hard to extract from JSON in raw SQL without knowing the dialect details
    
    const results = await sequelize.query(`
      SELECT p.category, SUM(o.total) as total
      FROM Orders o
      CROSS JOIN JSON_TABLE(o.items, '$[*]' COLUMNS (productId CHAR(36) PATH '$.product')) jt
      JOIN Products p ON p.id = jt.productId
      WHERE o.status = 'confirmed'
      GROUP BY p.category
    `, { type: sequelize.QueryTypes.SELECT }).catch(err => {
      console.warn('JSON_TABLE not supported or query failed, falling back', err.message);
      return []; // Fallback for simple demo or if MySQL version is old
    });

    const data = results.map(r => ({
      name: r.category,
      value: parseFloat(r.total)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

