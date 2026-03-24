const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// @route   POST /api/products
// @desc    Create a product
// @access  Private (Seller only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    
    // Convert frontend image string to backend images array
    const images = image ? [{ url: image }] : [];

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      seller: req.user._id,
      stock: 10 // Defaulting stock
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/seller
// @desc    Get all products for logged in seller
// @access  Private
router.get('/seller', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Make sure user owns product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products
// @desc    Get all active products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Return all active products, sorted newest first
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
