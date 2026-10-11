import "dotenv/config";

import app from "./app.js";

import pool from "./config/database.js";

import {
  port,
} from "./config/env.js";

async function startServer() {
  try {
    await pool.query(
      "SELECT 1"
    );

    console.log(
      "PostgreSQL connection successful"
    );

    const server =
      app.listen(
        port,
        "0.0.0.0",
        () => {
          console.log(
            `AzureDrop API running on port ${port}`
          );
        }
      );

    let shuttingDown =
      false;

    const shutdown =
      async (
        signal
      ) => {
        if (
          shuttingDown
        ) {
          return;
        }

        shuttingDown =
          true;

        console.log(
          `${signal} received. Shutting down...`
        );

        server.close(
          async () => {
            try {
              await pool.end();

              console.log(
                "PostgreSQL connection closed"
              );

              process.exit(
                0
              );
            } catch (
              error
            ) {
              console.error(
                "Error during shutdown:",
                error
              );

              process.exit(
                1
              );
            }
          }
        );
      };

    process.on(
      "SIGTERM",
      () =>
        shutdown(
          "SIGTERM"
        )
    );

    process.on(
      "SIGINT",
      () =>
        shutdown(
          "SIGINT"
        )
    );
  } catch (error) {
    console.error(
      "Unable to start AzureDrop:",
      error
    );

    process.exit(1);
  }
}

startServer();
