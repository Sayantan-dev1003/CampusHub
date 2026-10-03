const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { money, roundMoney } = require('../lib/money');
const { pageParams, sortOrder } = require('../lib/paging');
const { currentMembership } = require('./auth.service');
const { getOrganization } = require('./settings.service');

function serializeVariant(variant) {
  return {
    id: variant.id,
    productId: variant.productId,
    size: variant.size,
    stockQuantity: variant.stockQuantity,
    lowStockThreshold: variant.lowStockThreshold,
    sku: variant.sku,
    lowStock: variant.stockQuantity <= variant.lowStockThreshold,
    updatedAt: variant.updatedAt,
  };
}

function serializeProduct(product, membership) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: money(product.price),
    memberPrice: money(product.memberPrice),
    viewerPrice: membership && membership.status === 'ACTIVE' ? money(product.memberPrice) : money(product.price),
    imageUrl: product.imageUrl,
    status: product.status,
    updatedAt: product.updatedAt,
    variants: (product.variants || []).map(serializeVariant),
  };
}

async function listProducts(user, query) {
  const { page, limit, skip } = pageParams(query);
  const where = {};
  if (user?.role !== 'ADMIN') where.status = 'ACTIVE';
  else if (query.status) where.status = query.status;
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
  const membership = user ? await currentMembership(user.id) : null;
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortOrder(query, ['name', 'price', 'createdAt'], { createdAt: 'desc' }),
      include: { variants: true },
    }),
  ]);
  return { data: rows.map((product) => serializeProduct(product, membership)), meta: { page, limit, total } };
}

async function getProduct(productId, user) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  if (product.status !== 'ACTIVE' && user?.role !== 'ADMIN') {
    throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  }
  const membership = user ? await currentMembership(user.id) : null;
  return serializeProduct(product, membership);
}

async function createProduct(input) {
  const settings = await getOrganization();
  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      price: input.price,
      memberPrice: input.memberPrice || input.price,
      imageUrl: input.imageUrl,
      status: input.status || 'ACTIVE',
      variants: input.variants
        ? {
            create: input.variants.map((variant) => ({
              size: variant.size,
              stockQuantity: variant.stockQuantity,
              lowStockThreshold: variant.lowStockThreshold ?? settings.defaultLowStockThreshold,
              sku: variant.sku,
            })),
          }
        : undefined,
    },
    include: { variants: true },
  });
  return serializeProduct(product, null);
}

async function updateProduct(productId, input) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  const product = await prisma.product.update({
    where: { id: productId },
    data: input,
    include: { variants: true },
  });
  return serializeProduct(product, null);
}

async function addVariant(productId, input) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  const duplicate = await prisma.productVariant.findFirst({
    where: { productId, size: input.size },
  });
  if (duplicate) throw new ApiError(409, 'That size already exists for this product', 'CONFLICT');
  const settings = await getOrganization();
  const variant = await prisma.productVariant.create({
    data: {
      productId,
      size: input.size,
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold ?? settings.defaultLowStockThreshold,
      sku: input.sku,
    },
  });
  return serializeVariant(variant);
}

async function updateVariant(variantId, input) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw new ApiError(404, 'Variant not found', 'NOT_FOUND');
  if (input.size && input.size !== existing.size) {
    const duplicate = await prisma.productVariant.findFirst({
      where: { productId: existing.productId, size: input.size },
    });
    if (duplicate) throw new ApiError(409, 'That size already exists for this product', 'CONFLICT');
  }
  const variant = await prisma.productVariant.update({ where: { id: variantId }, data: input });
  return serializeVariant(variant);
}

async function updateStock(variantId, stockQuantity) {
  return updateVariant(variantId, { stockQuantity });
}

async function lowStock() {
  const variants = await prisma.productVariant.findMany({ include: { product: true } });
  return variants
    .filter((variant) => variant.stockQuantity <= variant.lowStockThreshold)
    .map((variant) => ({
      ...serializeVariant(variant),
      productName: variant.product.name,
    }));
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  addVariant,
  updateVariant,
  updateStock,
  lowStock,
  serializeProduct,
  serializeVariant,
};
