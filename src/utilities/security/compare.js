import bcrypt from "bcrypt";
export const compare = async ({ key, HashedKey }) => {
  return bcrypt.compare(key, HashedKey);
};
