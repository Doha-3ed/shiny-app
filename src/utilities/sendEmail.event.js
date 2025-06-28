import { EventEmitter } from "events";
import { customAlphabet } from "nanoid";
import { hash } from "./security/index.js";
import userModel from "../DB/models/user.model.js";
import { OTPtypes } from "./Enums.js";
import { sendEmail } from "../modules/user/service/sendEmail.js";
import { html } from "../modules/user/service/html.js";

export const eventemit = new EventEmitter();
eventemit.on("sendEmail", async (data) => {
  const { email } = data;
  const otp = customAlphabet("0123456789", 4)();
  const hashing = await hash({ key: otp, SALT_ROUND: process.env.SALT_ROUND });
  await userModel.updateOne(
    { email },
    {
      $push: {
        OTP: {
          code: hashing,
          type: OTPtypes.confirmEmail,
          expiresIn: new Date(Date.now() + 10 * 60*60 * 1000), // Expires in 10 min
        },
      },
    }
  );

  await sendEmail(email, "Confirm me", html({ otp, type: "Confirm Email" }));
});

eventemit.on("forgetPassword", async (data) => {
  const { email } = data;
  const otp = customAlphabet("0123456789", 4)();
  const hashing = await hash({ key: otp, SALT_ROUND: process.env.SALT_ROUND });
  await userModel.updateOne(
    { email },
    {
      $push: {
        OTP: {
          code: hashing,
          type: OTPtypes.forgetPassword,
          expiresIn: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 min
        },
      },
    }
  );

  await sendEmail(
    email,
    "forget Password",
    html({ otp, type: "forget Password" })
  );
});

eventemit.on("applicationStatus", async ({ email, result }) => {
  await sendEmail(email, "Application Update", result);
});
