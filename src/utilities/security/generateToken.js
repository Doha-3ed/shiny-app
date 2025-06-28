import jwt from "jsonwebtoken";
export const generateToken = async ({
  payload = {},
  PRIVATE_KEY = process.env.PRIVATE_KEY,
}) => {
  return jwt.sign(payload, PRIVATE_KEY);
}