import { Router } from "express";

import {
  login,
  register,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

import { findUserById } from "../repositories/user.repository.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
