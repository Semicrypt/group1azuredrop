import pg from "pg";

import {
  databaseSsl,
  databaseSslRejectUnauthorized,
  databaseUrl,
} from "./env.js";

const { Pool } = pg;

const config = {
  connectionString:
    databaseUrl,
};

if (databaseSsl) {
  config.ssl = {
    rejectUnauthorized:
      databaseSslRejectUnauthorized,
  };
}

const pool =
  new Pool(config);

pool.on(
  "error",
  (error) => {
    console.error(
      "Unexpected PostgreSQL error:",
      error
    );
  }
);

export default pool;
