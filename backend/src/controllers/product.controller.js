const productService = require('../services/product.service');

const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/products/${req.file.filename}`;
    if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
    const product = await productService.createProduct(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

const getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/products/${req.file.filename}`;
    const product = await productService.updateProduct(req.params.id, data);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

const updateVariantStock = async (req, res, next) => {
  try {
    const variant = await productService.updateVariantStock(req.params.variantId, req.body.quantity);
    res.json({ success: true, data: variant });
  } catch (err) { next(err); }
};

const deactivateProduct = async (req, res, next) => {
  try {
    await productService.deactivateProduct(req.params.id);
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) { next(err); }
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, updateVariantStock, deactivateProduct };
