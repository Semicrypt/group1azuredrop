function required(name) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

function optional(name) {
  const value =
    process.env[name]?.trim();

  return value || null;
}

function booleanValue(
  name,
  defaultValue
) {
  const value =
    process.env[name];

  if (
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  if (
    [
      "true",
      "1",
      "yes",
      "on",
    ].includes(normalized)
  ) {
    return true;
  }

  if (
    [
      "false",
      "0",
      "no",
      "off",
    ].includes(normalized)
  ) {
    return false;
  }

  throw new Error(
    `${name} must be true or false`
  );
}

function validUrl(
  name,
  value
) {
  if (!value) {
    return null;
  }

  try {
    return new URL(
      value
    ).toString()
      .replace(
        /\/$/,
        ""
      );
  } catch {
    throw new Error(
      `${name} must be a valid URL`
    );
  }
}

export const nodeEnv =
  process.env.NODE_ENV ||
  "development";

if (
  ![
    "development",
    "test",
    "production",
  ].includes(nodeEnv)
) {
  throw new Error(
    "NODE_ENV must be development, test, or production"
  );
}

export const isProduction =
  nodeEnv ===
  "production";

const parsedPort =
  Number(
    process.env.PORT ||
      5000
  );

if (
  !Number.isInteger(
    parsedPort
  ) ||
  parsedPort < 1 ||
  parsedPort > 65535
) {
  throw new Error(
    "PORT must be a valid TCP port"
  );
}

export const port =
  parsedPort;

export const databaseUrl =
  required(
    "DATABASE_URL"
  );

export const databaseSsl =
  booleanValue(
    "DATABASE_SSL",
    isProduction
  );

export const databaseSslRejectUnauthorized =
  booleanValue(
    "DATABASE_SSL_REJECT_UNAUTHORIZED",
    true
  );

export const jwtSecret =
  required(
    "JWT_SECRET"
  );

if (
  isProduction &&
  jwtSecret.length < 32
) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters in production"
  );
}

export const jwtExpiresIn =
  process.env
    .JWT_EXPIRES_IN ||
  "24h";

const configuredCors =
  optional(
    "CORS_ORIGINS"
  );

export const corsOrigins =
  configuredCors
    ? configuredCors
        .split(",")
        .map(
          (origin) =>
            origin.trim()
        )
        .filter(Boolean)
        .map(
          (origin) =>
            validUrl(
              "CORS_ORIGINS",
              origin
            )
        )
    : isProduction
      ? []
      : [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ];

if (
  isProduction &&
  corsOrigins.length === 0
) {
  throw new Error(
    "CORS_ORIGINS is required in production"
  );
}

export const publicBaseUrl =
  validUrl(
    "PUBLIC_BASE_URL",
    optional(
      "PUBLIC_BASE_URL"
    )
  );

if (
  isProduction &&
  !publicBaseUrl
) {
  throw new Error(
    "PUBLIC_BASE_URL is required in production"
  );
}

export const azureStorageConnectionString =
  optional(
    "AZURE_STORAGE_CONNECTION_STRING"
  );

export const azureStorageAccountName =
  optional(
    "AZURE_STORAGE_ACCOUNT_NAME"
  );

if (
  !azureStorageConnectionString &&
  !azureStorageAccountName
) {
  throw new Error(
    "Configure AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME"
  );
}

export const azureStorageContainerName =
  process.env
    .AZURE_STORAGE_CONTAINER_NAME
    ?.trim() ||
  "azuredrop-files";

export const azureStoragePublicBlobEndpoint =
  validUrl(
    "AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT",
    optional(
      "AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT"
    )
  );
