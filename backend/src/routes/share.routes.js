import { Router } from "express";

import {
  publicShareController,
  publicShareDownloadController,
} from "../controllers/share.controller.js";

const router = Router();

router.get(
  "/:token",
  publicShareController
);

router.get(
  "/:token/download",
  publicShareDownloadController
);

export default router;
