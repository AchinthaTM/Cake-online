const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/products
// @desc    Create a product
// @access  Private (Seller only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    
    let imageUrl = '';
    
    if (req.file) {
      // Store path relative to the root (since server.js serves /uploads statically)
      imageUrl = `/uploads/products/${req.file.filename}`;
    } else if (req.body.image) {
      // Fallback for URL if provided (though we are moving to file upload)
      imageUrl = req.body.image;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const images = [{ url: imageUrl }];

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      images,
      seller: req.user._id,
      stock: 10
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, message: error.message || 'Server error' });
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

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Seller only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { name, description, price, category, stock, isActive } = req.body;
    const updates = {
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      category: category || product.category,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive
    };

    if (req.file) {
      updates.images = [{ url: `/uploads/products/${req.file.filename}` }];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   GET /api/products
// @desc    Get all active products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) {
      filter.type = type;
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'firstName lastName sellerInfo');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/admin
// @desc    Get all products (Admin only)
// @access  Private (Admin only)
const { authorize } = require('../middleware/auth');
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('seller', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/products/admin/:id
// @desc    Hard delete a product (Admin only)
// @access  Private (Admin only)
router.delete('/admin/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product as admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
