const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');
const {
  createProduct, getAllProducts, getProductById,
  updateProduct, updateVariantStock, deactivateProduct,
} = require('../controllers/product.controller');

const router = express.Router();

// Public - browse products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only
router.use(protect);

router.post('/', authorize('ADMIN'), uploadProductImage.single('image'), createProduct);
router.put('/:id', authorize('ADMIN'), uploadProductImage.single('image'), updateProduct);
router.patch('/variants/:variantId/stock', authorize('ADMIN'), updateVariantStock);
router.patch('/:id/deactivate', authorize('ADMIN'), deactivateProduct);

module.exports = router;
