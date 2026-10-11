const imageMimeTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ]);

const documentMimeTypes =
  new Set([
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-powerpoint",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ]);

const spreadsheetMimeTypes =
  new Set([
    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "text/csv",
  ]);

const archiveMimeTypes =
  new Set([
    "application/zip",
    "application/x-zip-compressed",
  ]);

const textMimeTypes =
  new Set([
    "text/plain",
  ]);

export function detectFileCategory(
  mimeType
) {
  if (
    imageMimeTypes.has(
      mimeType
    )
  ) {
    return "images";
  }

  if (
    documentMimeTypes.has(
      mimeType
    )
  ) {
    return "documents";
  }

  if (
    spreadsheetMimeTypes.has(
      mimeType
    )
  ) {
    return "spreadsheets";
  }

  if (
    archiveMimeTypes.has(
      mimeType
    )
  ) {
    return "archives";
  }

  if (
    textMimeTypes.has(
      mimeType
    )
  ) {
    return "text";
  }

  return "other";
}