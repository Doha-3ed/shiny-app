import CryptoJS from "crypto-js";
export const encrypt = async ({
  key,
  SECRETE_KEY = process.env.SECRETE_KEY,
}) => {
  return CryptoJS.AES.encrypt(key, SECRETE_KEY).toString();
};
