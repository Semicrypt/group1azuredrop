import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import {
  DefaultAzureCredential,
} from "@azure/identity";

function parseConnectionString(value) {
  const parts = {};

  for (const segment of value.split(";")) {
    if (!segment) {
      continue;
    }

    const separatorIndex =
      segment.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key =
      segment.slice(
        0,
        separatorIndex
      );

    const entryValue =
      segment.slice(
        separatorIndex + 1
      );

    parts[key] =
      entryValue;
  }

  return parts;
}

const connectionString =
  process.env
    .AZURE_STORAGE_CONNECTION_STRING;

let resolvedAccountName =
  process.env
    .AZURE_STORAGE_ACCOUNT_NAME ||
  null;

let resolvedSharedKeyCredential =
  null;

let blobServiceClient;

if (connectionString) {
  const parsed =
    parseConnectionString(
      connectionString
    );

  resolvedAccountName =
    parsed.AccountName ||
    "devstoreaccount1";

  if (parsed.AccountKey) {
    resolvedSharedKeyCredential =
      new StorageSharedKeyCredential(
        resolvedAccountName,
        parsed.AccountKey
      );
  }

  blobServiceClient =
    BlobServiceClient
      .fromConnectionString(
        connectionString
      );
} else {
  if (!resolvedAccountName) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_NAME is not configured"
    );
  }

  blobServiceClient =
    new BlobServiceClient(
      `https://${resolvedAccountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
}

export const accountName =
  resolvedAccountName;

export const sharedKeyCredential =
  resolvedSharedKeyCredential;

export const containerName =
  process.env
    .AZURE_STORAGE_CONTAINER_NAME ||
  "azuredrop-files";

export const publicBlobEndpoint =
  process.env
    .AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT ||
  null;

export const usingConnectionString =
  Boolean(connectionString);

export default blobServiceClient;