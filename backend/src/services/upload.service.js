const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { env } = require('../config/env');
const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { getOrganization } = require('./settings.service');

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const RECEIPT_TYPES = new Set([...IMAGE_TYPES, 'application/pdf']);

const BUCKET = {
  avatar: 'avatars',
  product: 'products',
  logo: 'organization',
  receipt: 'receipts',
};

function client() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new ApiError(503, 'File storage is not configured', 'STORAGE_NOT_CONFIGURED');
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

function assertFile(purpose, file) {
  if (!file) throw new ApiError(400, 'File is required', 'VALIDATION_ERROR');
  const allowed = purpose === 'receipt' ? RECEIPT_TYPES : IMAGE_TYPES;
  if (!allowed.has(file.mimetype)) {
    throw new ApiError(400, 'File type is not allowed', 'VALIDATION_ERROR');
  }
}

async function storeFile(purpose, userId, file) {
  assertFile(purpose, file);
  const bucket = BUCKET[purpose];
  const extension = path.extname(file.originalname || '').toLowerCase().slice(0, 8) || '';
  const objectPath = `${userId}/${Date.now()}${extension}`;
  const supabase = client();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new ApiError(502, error.message, 'STORAGE_NOT_CONFIGURED');
  const storagePath = `${bucket}/${objectPath}`;
  if (purpose === 'receipt') {
    const signed = await supabase.storage.from(bucket).createSignedUrl(objectPath, 60 * 60);
    return { bucket, path: objectPath, storagePath, url: signed.data?.signedUrl || storagePath };
  }
  const pub = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return { bucket, path: objectPath, storagePath, url: pub.data.publicUrl };
}

async function readableUrl(stored) {
  if (!stored || !String(stored).startsWith('receipts/')) return stored;
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return stored;
  const objectPath = stored.slice('receipts/'.length);
  const supabase = client();
  const signed = await supabase.storage.from('receipts').createSignedUrl(objectPath, 60 * 60);
  return signed.data?.signedUrl || stored;
}

async function upload(user, purpose, file, recordId) {
  if (!BUCKET[purpose]) throw new ApiError(400, 'Unknown upload purpose', 'VALIDATION_ERROR');
  if ((purpose === 'product' || purpose === 'logo') && user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
  }
  const stored = await storeFile(purpose, user.id, file);
  if (!recordId) return stored;

  if (purpose === 'avatar') {
    if (recordId !== user.id && user.role !== 'ADMIN') throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    await prisma.user.update({ where: { id: recordId }, data: { profileImage: stored.url } });
  } else if (purpose === 'product') {
    await prisma.product.update({ where: { id: recordId }, data: { imageUrl: stored.url } });
  } else if (purpose === 'logo') {
    const settings = await getOrganization();
    await prisma.organizationSetting.update({ where: { id: settings.id }, data: { logoUrl: stored.url } });
  } else if (purpose === 'receipt') {
    const expense = await prisma.expense.findUnique({ where: { id: recordId } });
    if (!expense) throw new ApiError(404, 'Expense not found', 'NOT_FOUND');
    if (expense.submittedById !== user.id && user.role !== 'TREASURER') {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }
    await prisma.expense.update({ where: { id: recordId }, data: { receiptUrl: stored.storagePath } });
  }
  return stored;
}

module.exports = { upload, storeFile, readableUrl };
