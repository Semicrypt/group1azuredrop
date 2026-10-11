import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";

import {
  corsOrigins,
} from "./config/env.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import shareRoutes from "./routes/share.routes.js";

import {
  MAX_FILE_SIZE_MB,
} from "./middleware/upload.middleware.js";

const app = express();

app.disable(
  "x-powered-by"
);

app.use(
  helmet()
);

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      if (
        !origin ||
        corsOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      const error =
        new Error(
          "Origin not allowed by CORS"
        );

      error.status =
        403;

      return callback(
        error
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(
  morgan(
    "combined"
  )
);

app.get(
  "/",
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        name:
          "AzureDrop API",

        description:
          "Secure Azure File Storage Platform",

        version:
          "1.0.0",
      });
  }
);

app.use(
  "/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/files",
  fileRoutes
);

app.use(
  "/api/share",
  shareRoutes
);

app.use(
  (req, res) => {
    return res
      .status(404)
      .json({
        success: false,

        message:
          "Route not found",
      });
  }
);

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      !error.status ||
      error.status >= 500
    ) {
      console.error(
        error
      );
    }

    if (
      error.name ===
      "ZodError"
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Validation failed",

          errors:
            error.issues.map(
              (
                issue
              ) => ({
                field:
                  issue.path.join(
                    "."
                  ),

                message:
                  issue.message,
              })
            ),
        });
    }

    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(413)
          .json({
            success:
              false,

            message:
              `File exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB} MB`,
          });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Only one file can be uploaded at a time",
          });
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Unexpected file field",
          });
      }

      return res
        .status(400)
        .json({
          success:
            false,

          message:
            error.message,
        });
    }

    if (
      error.status
    ) {
      return res
        .status(
          error.status
        )
        .json({
          success:
            false,

          message:
            error.message,
        });
    }

    return res
      .status(500)
      .json({
        success: false,

        message:
          process.env
            .NODE_ENV ===
          "production"
            ? "Internal server error"
            : error.message ||
              "Internal server error",
      });
  }
);

export default app;