import pool from "../config/database.js";

export async function createShareLink({
  fileId,
  tokenHash,
  expiresAt,
}) {
  const result =
    await pool.query(
      `
        INSERT INTO share_links (
          file_id,
          token,
          expires_at
        )
        VALUES ($1, $2, $3)

        RETURNING
          id,
          file_id,
          expires_at,
          created_at
      `,
      [
        fileId,
        tokenHash,
        expiresAt,
      ]
    );

  return result.rows[0];
}

export async function findShareByTokenHash(
  tokenHash
) {
  const result =
    await pool.query(
      `
        SELECT
          sl.id AS share_id,
          sl.file_id,
          sl.expires_at,
          sl.created_at,

          f.user_id,
          f.original_name,
          f.blob_name,
          f.container_name,
          f.mime_type,
          f.size_bytes,
          f.category,
          f.description,
          f.storage_provider,
          f.storage_provider AS storage_mode,
          f.uploaded_at

        FROM share_links sl

        INNER JOIN files f
          ON f.id = sl.file_id

        WHERE sl.token = $1
        LIMIT 1
      `,
      [tokenHash]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function findSharesForFile(
  fileId,
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          sl.id,
          sl.file_id,
          sl.expires_at,
          sl.created_at,

          CASE
            WHEN sl.expires_at > NOW()
            THEN true
            ELSE false
          END AS active

        FROM share_links sl

        INNER JOIN files f
          ON f.id = sl.file_id

        WHERE sl.file_id = $1
          AND f.user_id = $2

        ORDER BY
          sl.created_at DESC
      `,
      [
        fileId,
        userId,
      ]
    );

  return result.rows;
}

export async function deleteShareLink({
  shareId,
  fileId,
  userId,
}) {
  const result =
    await pool.query(
      `
        DELETE FROM share_links sl

        USING files f

        WHERE sl.id = $1
          AND sl.file_id = $2
          AND f.id = sl.file_id
          AND f.user_id = $3

        RETURNING sl.id
      `,
      [
        shareId,
        fileId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function deleteExpiredShareLinks() {
  const result =
    await pool.query(
      `
        DELETE FROM share_links
        WHERE expires_at <= NOW()

        RETURNING id
      `
    );

  return result.rowCount;
}