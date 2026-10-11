import { Router } from "express";

import pool from "../config/database.js";

import blobServiceClient, {
  containerName,
} from "../config/blob.js";

const router = Router();

router.get(
  "/",
  async (req, res) => {
    const startedAt =
      Date.now();

    const [
      databaseResult,
      storageResult,
    ] =
      await Promise.allSettled([
        pool.query(
          "SELECT 1"
        ),

        blobServiceClient
          .getContainerClient(
            containerName
          )
          .getProperties(),
      ]);

    const databaseHealthy =
      databaseResult.status ===
      "fulfilled";

    const storageHealthy =
      storageResult.status ===
      "fulfilled";

    const healthy =
      databaseHealthy &&
      storageHealthy;

    if (!databaseHealthy) {
      console.error(
        "Health check database failure:",
        databaseResult.reason
      );
    }

    if (!storageHealthy) {
      console.error(
        "Health check storage failure:",
        storageResult.reason
      );
    }

    const response = {
      success:
        healthy,

      status:
        healthy
          ? "healthy"
          : "unhealthy",

      service:
        "azuredrop-api",

      database:
        databaseHealthy
          ? "healthy"
          : "unhealthy",

      storage:
        storageHealthy
          ? "healthy"
          : "unhealthy",

      storageProvider:
        "azure_blob",

      uptime:
        process.uptime(),

      responseTimeMs:
        Date.now() -
        startedAt,

      timestamp:
        new Date()
          .toISOString(),
    };

    return res
      .status(
        healthy
          ? 200
          : 503
      )
      .json(
        response
      );
  }
);

export default router;