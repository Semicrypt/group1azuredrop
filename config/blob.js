const crypto = require('crypto');
global.crypto = crypto;
globalThis.crypto = crypto;
const { BlobServiceClient } = require('@azure/storage-blob');

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || 'drops';

const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

async function getContainerClient() {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

module.exports = { getContainerClient, blobServiceClient };