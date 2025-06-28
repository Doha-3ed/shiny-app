import bcrypt from "bcrypt";
export const hash = async ({ key, SALT_ROUND = process.env.SALT_ROUND }) => {
  return bcrypt.hash(key, Number(SALT_ROUND));
};
