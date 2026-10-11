import { z } from "zod";

import {
  loginUser,
  registerUser,
} from "../services/auth.service.js";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("A valid email address is required"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password is too long"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);

    const result = await registerUser(input);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
