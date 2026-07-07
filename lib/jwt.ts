import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "super-secret-key-change-this";

export function generateToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
