import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";

export const fileTypes = {
  image: ["image/jpeg", "image/png", "image/gif","image/jpg","image/webp"],
  video: ["video/mp4"],
  audio: ["audio/mpeg"],
  pdf: ["application/pdf"],
};

export const multerLocal = (customeValidation = [], customPath = "general") => {
  const fullPath = `downloads/${customPath}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      cb(null, nanoid(4) + file.originalname);
    },
  });
  const fileFilter = (req, file, cb) => {
    if (customeValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format!"), false);
    }
  };

  const upload = multer({ storage, fileFilter });
  return upload;
};
export const multerHost = (customData = []) => {
  const storage = multer.diskStorage({});
  const fileFilter = (req, file, cb) => {
    if (customData.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format!"), false);
    }
  };

  const upload = multer({ fileFilter, storage });
  return upload;
};
