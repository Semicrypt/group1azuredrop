const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { BlobServiceClient } = require('@azure/storage-blob');
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

// --- Azure Blob Storage (Azurite locally, real Azure Blob Storage in production) ---
const AZURE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING ||
  'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;';
const CONTAINER_NAME = 'vektralock-files';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

async function ensureContainer() {
  await containerClient.createIfNotExists();
}
ensureContainer().catch((err) => console.error('Failed to set up blob container:', err));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded (expected field name "file")' });
    }

    const blobName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    const file = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        storedName: blobName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || 'general',
        ownerId: req.user.id,
      },
    });

    res.status(201).json({ file });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Something went wrong during upload' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, category } = req.query;

    const files = await prisma.file.findMany({
      where: {
        ownerId: req.user.id,
        ...(search && { filename: { contains: search, mode: 'insensitive' } }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ files });
  } catch (err) {
    console.error('List files error:', err);
    res.status(500).json({ error: 'Something went wrong fetching files' });
  }
});

router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: Number(req.params.id) } });

    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have access to this file' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(file.storedName);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', file.mimeType);

    const downloadResponse = await blockBlobClient.download();
    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Something went wrong during download' });
  }
});

router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: Number(req.params.id) } });

    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Only the file owner can create a share link' });
    }

    const shareToken = crypto.randomBytes(24).toString('hex');
    const shareExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.file.update({
      where: { id: file.id },
      data: { shareToken, shareExpires },
    });

    res.json({ shareUrl: `/api/files/shared/${shareToken}`, expiresAt: shareExpires });
  } catch (err) {
    console.error('Share link error:', err);
    res.status(500).json({ error: 'Something went wrong creating the share link' });
  }
});

router.get('/shared/:token', async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { shareToken: req.params.token } });

    if (!file || !file.shareExpires || file.shareExpires < new Date()) {
      return res.status(410).json({ error: 'This share link is invalid or has expired' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(file.storedName);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', file.mimeType);

    const downloadResponse = await blockBlobClient.download();
    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error('Shared download error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      include: { owner: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ files });
  } catch (err) {
    console.error('Admin list error:', err);
    res.status(500).json({ error: 'Something went wrong fetching all files' });
  }
});

module.exports = router;
