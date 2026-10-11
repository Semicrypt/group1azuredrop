import {
  createFileDownloadUrl,
  deleteUserFile,
  getUserFileMetadata,
  listUserFiles,
  uploadFile,
} from "../services/file.service.js";

export async function uploadFileController(
  req,
  res,
  next
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A file is required",
      });
    }

    const file =
      await uploadFile({
        userId: req.user.id,
        file: req.file,

        description:
          req.body.description ||
          null,
      });

    return res.status(201).json({
      success: true,

      message:
        "File uploaded successfully",

      data: {
        file,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listFilesController(
  req,
  res,
  next
) {
  try {
    const files =
      await listUserFiles({
        userId:
          req.user.id,

        search:
          req.query.search?.trim() ||
          null,

        category:
          req.query.category?.trim() ||
          null,
      });

    return res.status(200).json({
      success: true,
      count: files.length,

      data: {
        files,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFileController(
  req,
  res,
  next
) {
  try {
    const file =
      await getUserFileMetadata({
        fileId:
          req.params.id,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,

      data: {
        file,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadFileController(
  req,
  res,
  next
) {
  try {
    const result =
      await createFileDownloadUrl({
        fileId:
          req.params.id,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,

      message:
        "Temporary download URL generated",

      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFileController(
  req,
  res,
  next
) {
  try {
    const result =
      await deleteUserFile({
        fileId:
          req.params.id,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,

      message:
        "File deleted successfully",

      data: {
        file: result,
      },
    });
  } catch (error) {
    next(error);
  }
}