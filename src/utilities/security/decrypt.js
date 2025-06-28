import CryptoJS from "crypto-js";
export const decrypt =  (key, SECRETE_KEY = process.env.SECRETE_KEY) => {
 
return CryptoJS.AES.decrypt(key, SECRETE_KEY).toString(CryptoJS.enc.Utf8); 
  
};
