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
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Products not found' });
    }

    const sellerId = products[0].seller;
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    let total = 0;
    const orderItems = items.map(item => {
      const dbProduct = products.find(p => p._id.toString() === item.product.toString());
      total += dbProduct.price * item.quantity;
      return {
        product: dbProduct._id,
        quantity: item.quantity,
        price: dbProduct.price
      };
    });

    const order = await Order.create({
      customer: req.user._id,
      seller: sellerId,
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
    const buyer = await User.findById(req.user._id);
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

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    // Send Email to Buyer
    const buyer = await User.findById(order.customer);
    const seller = await User.findById(req.user._id);

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
    const orders = await Order.find({ seller: req.user._id })
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
