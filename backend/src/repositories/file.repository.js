import pool from "../config/database.js";

export async function createFileRecord({
  userId,
  originalName,
  blobName,
  containerName,
  mimeType,
  sizeBytes,
  category,
  description,
  storageProvider = "azure_blob",
}) {
  const result =
    await pool.query(
      `
        INSERT INTO files (
          user_id,
          original_name,
          blob_name,
          container_name,
          mime_type,
          size_bytes,
          category,
          description,
          storage_provider
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )

        RETURNING
          id,
          user_id,
          original_name,
          blob_name,
          container_name,
          mime_type,
          size_bytes,
          category,
          description,
          storage_provider,
          storage_provider AS storage_mode,
          uploaded_at,
          updated_at
      `,
      [
        userId,
        originalName,
        blobName,
        containerName,
        mimeType,
        sizeBytes,
        category,
        description || null,
        storageProvider,
      ]
    );

  return result.rows[0];
}

export async function findFilesByUser({
  userId,
  search,
  category,
}) {
  const conditions =
    ["user_id = $1"];

  const values =
    [userId];

  if (search) {
    values.push(
      `%${search}%`
    );

    conditions.push(
      `original_name ILIKE $${values.length}`
    );
  }

  if (category) {
    values.push(
      category
    );

    conditions.push(
      `category = $${values.length}`
    );
  }

  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          original_name,
          mime_type,
          size_bytes,
          category,
          description,
          storage_provider,
          storage_provider AS storage_mode,
          uploaded_at,
          updated_at
        FROM files
        WHERE ${conditions.join(
          " AND "
        )}
        ORDER BY uploaded_at DESC
      `,
      values
    );

  return result.rows;
}

export async function findFileByIdForUser(
  fileId,
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          original_name,
          blob_name,
          container_name,
          mime_type,
          size_bytes,
          category,
          description,
          storage_provider,
          storage_provider AS storage_mode,
          uploaded_at,
          updated_at
        FROM files
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
      `,
      [
        fileId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function findFileMetadataByIdForUser(
  fileId,
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          original_name,
          mime_type,
          size_bytes,
          category,
          description,
          storage_provider,
          storage_provider AS storage_mode,
          uploaded_at,
          updated_at
        FROM files
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
      `,
      [
        fileId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function deleteFileRecord(
  fileId,
  userId
) {
  const result =
    await pool.query(
      `
        DELETE FROM files
        WHERE id = $1
          AND user_id = $2

        RETURNING id
      `,
      [
        fileId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}