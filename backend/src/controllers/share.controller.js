import {
  publicBaseUrl,
} from "../config/env.js";

import {
  createTemporaryShare,
  listFileShares,
  resolveShareToken,
  revokeShare,
} from "../services/share.service.js";

export async function createShareController(
  req,
  res,
  next
) {
  try {
    const result =
      await createTemporaryShare({
        fileId: req.params.id,

        userId: req.user.id,

        expiresInMinutes:
          req.body
            .expiresInMinutes,
      });

    const baseUrl =
      (
        publicBaseUrl ||
        `${req.protocol}://${req.get(
          "host"
        )}`
      ).replace(
        /\\\/$/,
        ""
      );

    const shareUrl =
      `${baseUrl}/api/share/${result.token}/download`;

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Temporary share link created",

        data: {
          share: {
            id:
              result.share.id,

            fileId:
              result.share.file_id,

            expiresAt:
              result.share.expires_at,

            createdAt:
              result.share.created_at,

            expiresInMinutes:
              result.expiresInMinutes,

            shareUrl,
          },
        },
      });
  } catch (error) {
    next(error);
  }
}

export async function publicShareController(
  req,
  res,
  next
) {
  try {
    const result =
      await resolveShareToken(
        req.params.token
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Share link is valid",

        data: result,
      });
  } catch (error) {
    next(error);
  }
}

export async function publicShareDownloadController(
  req,
  res,
  next
) {
  try {
    const result =
      await resolveShareToken(
        req.params.token
      );

    return res.redirect(
      302,
      result.downloadUrl
    );
  } catch (error) {
    next(error);
  }
}

export async function listSharesController(
  req,
  res,
  next
) {
  try {
    const shares =
      await listFileShares({
        fileId:
          req.params.id,

        userId:
          req.user.id,
      });

    return res
      .status(200)
      .json({
        success: true,

        count:
          shares.length,

        data: {
          shares,
        },
      });
  } catch (error) {
    next(error);
  }
}

export async function revokeShareController(
  req,
  res,
  next
) {
  try {
    await revokeShare({
      shareId:
        req.params.shareId,

      fileId:
        req.params.id,

      userId:
        req.user.id,
    });

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Share link revoked successfully",
      });
  } catch (error) {
    next(error);
  }
}
