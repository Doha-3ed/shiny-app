import dotenv from "dotenv";
import path from "path";

import { v2 as cloudinary } from "cloudinary";
dotenv.config({ path: path.resolve("src/config/.env") });
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,

  api_secret: process.env.API_SECRET,
});

export default cloudinary;
