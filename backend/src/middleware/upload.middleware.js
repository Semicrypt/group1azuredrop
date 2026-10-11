import path from "path";
import multer from "multer";

const DEFAULT_MAX_FILE_SIZE_MB = 10;

const configuredMaxFileSizeMb =
  Number.parseInt(
    process.env.MAX_FILE_SIZE_MB ||
      String(DEFAULT_MAX_FILE_SIZE_MB),
    10
  );

export const MAX_FILE_SIZE_MB =
  Number.isInteger(
    configuredMaxFileSizeMb
  ) &&
  configuredMaxFileSizeMb > 0
    ? configuredMaxFileSizeMb
    : DEFAULT_MAX_FILE_SIZE_MB;

const maxFileSizeBytes =
  MAX_FILE_SIZE_MB *
  1024 *
  1024;

/*
 * AzureDrop accepted upload formats.
 *
 * We validate both the filename extension
 * and the MIME type reported by the client.
 *
 * This is stronger than MIME-only validation,
 * although production malware/content scanning
 * can still be added later.
 */
const allowedFileTypes =
  new Map([
    [
      ".jpg",
      new Set([
        "image/jpeg",
      ]),
    ],

    [
      ".jpeg",
      new Set([
        "image/jpeg",
      ]),
    ],

    [
      ".png",
      new Set([
        "image/png",
      ]),
    ],

    [
      ".gif",
      new Set([
        "image/gif",
      ]),
    ],

    [
      ".webp",
      new Set([
        "image/webp",
      ]),
    ],

    [
      ".pdf",
      new Set([
        "application/pdf",
      ]),
    ],

    [
      ".txt",
      new Set([
        "text/plain",
      ]),
    ],

    [
      ".csv",
      new Set([
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
      ]),
    ],

    [
      ".doc",
      new Set([
        "application/msword",
      ]),
    ],

    [
      ".docx",
      new Set([
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]),
    ],

    [
      ".xls",
      new Set([
        "application/vnd.ms-excel",
      ]),
    ],

    [
      ".xlsx",
      new Set([
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]),
    ],

    [
      ".ppt",
      new Set([
        "application/vnd.ms-powerpoint",
      ]),
    ],

    [
      ".pptx",
      new Set([
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ]),
    ],

    [
      ".zip",
      new Set([
        "application/zip",
        "application/x-zip-compressed",
      ]),
    ],
  ]);

function createUploadError(
  message
) {
  const error =
    new Error(message);

  error.status = 400;

  return error;
}

function fileFilter(
  req,
  file,
  callback
) {
  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();

  if (!extension) {
    return callback(
      createUploadError(
        "File must have a supported extension"
      ),
      false
    );
  }

  const allowedMimeTypes =
    allowedFileTypes.get(
      extension
    );

  if (!allowedMimeTypes) {
    return callback(
      createUploadError(
        `Unsupported file extension: ${extension}`
      ),
      false
    );
  }

  if (
    !allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    return callback(
      createUploadError(
        `File type does not match its extension: ${file.originalname}`
      ),
      false
    );
  }

  return callback(
    null,
    true
  );
}

export const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        maxFileSizeBytes,

      files:
        1,
    },

    fileFilter,
  });