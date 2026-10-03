const prisma = require('../config/db');

/**
 * Create a product with variants
 */
const createProduct = async ({ name, description, category, price, memberPrice, imageUrl, variants }) => {
  return prisma.product.create({
    data: {
      name,
      description,
      category,
      price: Number(price),
      memberPrice: memberPrice ? Number(memberPrice) : null,
      imageUrl,
      variants: {
        createMany: {
          data: (variants || []).map((v) => ({ size: v.size, quantity: Number(v.quantity) })),
        },
      },
    },
    include: { variants: true },
  });
};

/**
 * Get all products
 */
const getAllProducts = async ({ page = 1, limit = 20, category, active = 'true' }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(category && { category: { contains: category, mode: 'insensitive' } }),
    ...(active !== 'all' && { isActive: active === 'true' }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get product by ID
 */
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  return product;
};

/**
 * Update a product
 */
const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  const { variants, ...rest } = data;
  return prisma.product.update({ where: { id }, data: rest, include: { variants: true } });
};

/**
 * Update variant stock quantity
 */
const updateVariantStock = async (variantId, quantity) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw Object.assign(new Error('Variant not found'), { statusCode: 404 });
  return prisma.productVariant.update({ where: { id: variantId }, data: { quantity: Number(quantity) } });
};

/**
 * Soft-delete (deactivate) product
 */
const deactivateProduct = async (id) => {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, updateVariantStock, deactivateProduct };
