import {
  randomUUID,
} from "crypto";

import {
  createFileRecord,
  deleteFileRecord,
  findFileByIdForUser,
  findFileMetadataByIdForUser,
  findFilesByUser,
} from "../repositories/file.repository.js";

import {
  detectFileCategory,
} from "../utils/file-category.js";

import {
  createBlobReadUrl,
  getFileStorage,
  getUploadStorage,
} from "./storage.service.js";

export async function uploadFile({
  userId,
  file,
  description,
}) {
  const storage =
    await getUploadStorage();

  const extension =
    file.originalname.includes(
      "."
    )
      ? file.originalname
          .split(".")
          .pop()
      : "";

  const uniqueName =
    extension
      ? `${randomUUID()}.${extension}`
      : randomUUID();

  const category =
    detectFileCategory(
      file.mimetype
    );

  const blobName =
    `users/${userId}/${category}/${uniqueName}`;

  const blockBlobClient =
    storage.containerClient
      .getBlockBlobClient(
        blobName
      );

  await blockBlobClient.uploadData(
    file.buffer,
    {
      blobHTTPHeaders: {
        blobContentType:
          file.mimetype,
      },

      metadata: {
        originalname:
          encodeURIComponent(
            file.originalname
          ),

        userid:
          userId,
      },
    }
  );

  try {
    return await createFileRecord({
      userId,

      originalName:
        file.originalname,

      blobName,

      containerName:
        storage.containerName,

      mimeType:
        file.mimetype,

      sizeBytes:
        file.size,

      category,

      description,

      storageProvider:
        storage.storageProvider,
    });
  } catch (error) {
    await blockBlobClient
      .deleteIfExists();

    throw error;
  }
}

export async function listUserFiles({
  userId,
  search,
  category,
}) {
  return findFilesByUser({
    userId,
    search,
    category,
  });
}

export async function getUserFileMetadata({
  fileId,
  userId,
}) {
  const file =
    await findFileMetadataByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error(
        "File not found"
      );

    error.status = 404;

    throw error;
  }

  return file;
}

export async function createFileDownloadUrl({
  fileId,
  userId,
}) {
  const file =
    await findFileByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error(
        "File not found"
      );

    error.status = 404;

    throw error;
  }

  const url =
    await createBlobReadUrl({
      containerName:
        file.container_name,

      blobName:
        file.blob_name,

      expiresIn:
        300,

      downloadName:
        file.original_name,
    });

  return {
    file: {
      id:
        file.id,

      originalName:
        file.original_name,

      mimeType:
        file.mime_type,

      sizeBytes:
        file.size_bytes,

      category:
        file.category,

      storageMode:
        file.storage_mode,

      storageProvider:
        file.storage_provider,
    },

    downloadUrl:
      url,

    expiresIn:
      300,
  };
}

export async function deleteUserFile({
  fileId,
  userId,
}) {
  const file =
    await findFileByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error(
        "File not found"
      );

    error.status = 404;

    throw error;
  }

  const storage =
    await getFileStorage(
      file
    );

  const blockBlobClient =
    storage.containerClient
      .getBlockBlobClient(
        file.blob_name
      );

  await blockBlobClient
    .deleteIfExists();

  const deleted =
    await deleteFileRecord(
      fileId,
      userId
    );

  if (!deleted) {
    const error =
      new Error(
        "Unable to delete file metadata"
      );

    error.status = 500;

    throw error;
  }

  return {
    id:
      file.id,

    originalName:
      file.original_name,

    storageMode:
      file.storage_mode,

    storageProvider:
      file.storage_provider,
  };
}