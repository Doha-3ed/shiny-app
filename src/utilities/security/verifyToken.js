import jwt from "jsonwebtoken";
export const verifyToken = async ({
  key,
  PRIVATE_KEY = process.env.PRIVATE_KEY,
}) => {
  return jwt.verify(key, PRIVATE_KEY);
};
