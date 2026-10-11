import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  upload,
} from "../middleware/upload.middleware.js";

import {
  deleteFileController,
  downloadFileController,
  getFileController,
  listFilesController,
  uploadFileController,
} from "../controllers/file.controller.js";

import {
  createShareController,
  listSharesController,
  revokeShareController,
} from "../controllers/share.controller.js";

const router = Router();

// List files
//
// GET /api/files
//
// Optional:
// ?search=report
// ?category=documents
router.get(
  "/",
  requireAuth,
  listFilesController
);

// Upload file
//
// POST /api/files
router.post(
  "/",
  requireAuth,
  upload.single("file"),
  uploadFileController
);

// Get single-file metadata
//
// GET /api/files/:id
router.get(
  "/:id",
  requireAuth,
  getFileController
);

// Generate authenticated temporary download URL
//
// GET /api/files/:id/download
router.get(
  "/:id/download",
  requireAuth,
  downloadFileController
);

// Create public temporary share link
//
// POST /api/files/:id/share
router.post(
  "/:id/share",
  requireAuth,
  createShareController
);

// List share links created for file
//
// GET /api/files/:id/shares
router.get(
  "/:id/shares",
  requireAuth,
  listSharesController
);

// Revoke share link
//
// DELETE /api/files/:id/share/:shareId
router.delete(
  "/:id/share/:shareId",
  requireAuth,
  revokeShareController
);

// Delete file from Azure Blob Storage and PostgreSQL
//
// DELETE /api/files/:id
router.delete(
  "/:id",
  requireAuth,
  deleteFileController
);

export default router;