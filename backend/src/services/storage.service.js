import {
  BlobSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import blobServiceClient, {
  accountName,
  containerName as defaultContainerName,
  publicBlobEndpoint,
  sharedKeyCredential,
} from "../config/blob.js";

export async function ensureStorageContainer() {
  const containerClient =
    blobServiceClient
      .getContainerClient(
        defaultContainerName
      );

  await containerClient
    .createIfNotExists();

  return containerClient;
}

export async function getUploadStorage() {
  const containerClient =
    await ensureStorageContainer();

  return {
    containerClient,

    containerName:
      defaultContainerName,

    storageProvider:
      "azure_blob",
  };
}

export async function getFileStorage(
  file
) {
  const targetContainer =
    file.container_name ||
    defaultContainerName;

  if (!targetContainer) {
    const error =
      new Error(
        "Blob container information is missing"
      );

    error.status = 500;

    throw error;
  }

  const containerClient =
    blobServiceClient
      .getContainerClient(
        targetContainer
      );

  return {
    containerClient,

    containerName:
      targetContainer,

    storageProvider:
      "azure_blob",
  };
}

function makePublicBlobUrl(
  blobUrl
) {
  if (!publicBlobEndpoint) {
    return blobUrl;
  }

  const serviceUrl =
    blobServiceClient
      .url
      .replace(
        /\/+$/,
        ""
      );

  const publicEndpoint =
    publicBlobEndpoint.replace(
      /\/+$/,
      ""
    );

  return blobUrl.replace(
    serviceUrl,
    publicEndpoint
  );
}

function getSafeDownloadName({
  downloadName,
  blobName,
}) {
  const fallbackName =
    String(
      blobName || "download"
    )
      .split("/")
      .pop() ||
    "download";

  return String(
    downloadName ||
      fallbackName
  )
    .replace(
      /["\\\r\n]/g,
      "_"
    )
    .trim() ||
    "download";
}

export async function createBlobReadUrl({
  containerName,
  blobName,
  expiresIn = 300,
  downloadName,
}) {
  if (!containerName) {
    const error =
      new Error(
        "Blob container name is required"
      );

    error.status = 500;

    throw error;
  }

  if (!blobName) {
    const error =
      new Error(
        "Blob name is required"
      );

    error.status = 500;

    throw error;
  }

  const startsOn =
    new Date(
      Date.now() -
        5 * 60 * 1000
    );

  const expiresOn =
    new Date(
      Date.now() +
        expiresIn * 1000
    );

  const safeDownloadName =
    getSafeDownloadName({
      downloadName,
      blobName,
    });

  /*
   * Content-Disposition is included
   * in the SAS response overrides.
   *
   * This tells the browser to download
   * the Blob rather than displaying
   * supported content such as text,
   * PDFs or images inline.
   */
  const options = {
    containerName,
    blobName,

    permissions:
      BlobSASPermissions.parse(
        "r"
      ),

    startsOn,
    expiresOn,

    contentDisposition:
      `attachment; filename="${safeDownloadName}"`,
  };

  let sasToken;

  /*
   * Local development / Azurite:
   * sign using the emulator's
   * development shared key.
   */
  if (sharedKeyCredential) {
    options.protocol =
      SASProtocol.HttpsAndHttp;

    sasToken =
      generateBlobSASQueryParameters(
        options,
        sharedKeyCredential
      ).toString();
  } else {
    /*
     * Azure production:
     * use Microsoft Entra ID /
     * Managed Identity to obtain
     * a user delegation key.
     */
    options.protocol =
      SASProtocol.Https;

    if (!accountName) {
      const error =
        new Error(
          "Azure Storage account name is required for user delegation SAS"
        );

      error.status = 500;

      throw error;
    }

    const userDelegationKey =
      await blobServiceClient
        .getUserDelegationKey(
          startsOn,
          expiresOn
        );

    sasToken =
      generateBlobSASQueryParameters(
        options,
        userDelegationKey,
        accountName
      ).toString();
  }

  const containerClient =
    blobServiceClient
      .getContainerClient(
        containerName
      );

  const blobClient =
    containerClient
      .getBlobClient(
        blobName
      );

  const publicUrl =
    makePublicBlobUrl(
      blobClient.url
    );

  return `${publicUrl}?${sasToken}`;
}