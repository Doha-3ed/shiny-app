import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("src/config/.env") });
const connectionDb = async () => {
  await mongoose
    .connect(process.env.ONLINE_CONNECTION)
    .then(() => {
      console.log("connected to DB successfully");
    })
    .catch((error) => {
      console.log({ msg: "error in DBConnection", error });
    });
};

export default connectionDb;