import jwt from "jsonwebtoken";

import {
  jwtExpiresIn,
  jwtSecret,
} from "../config/env.js";

export function generateToken(
  user
) {
  return jwt.sign(
    {
      sub: user.id,
      email:
        user.email,
    },
    jwtSecret,
    {
      expiresIn:
        jwtExpiresIn,
    }
  );
}

export function verifyToken(
  token
) {
  return jwt.verify(
    token,
    jwtSecret
  );
}
