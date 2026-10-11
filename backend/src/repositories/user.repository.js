import pool from "../config/database.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        created_at,
        updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password_hash
      )
      VALUES ($1, LOWER($2), $3)

      RETURNING
        id,
        name,
        email,
        created_at,
        updated_at
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}
