import mongoose from "mongoose";
import { hairType, OTPtypes, provider, role, skinType } from "../../utilities/Enums.js";
import { encrypt, hash } from "../../utilities/security/index.js";



const userSchema = new mongoose.Schema(
  {
   
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required:  function () { return this.provider === provider.system; },
    },
    hairType: { type: String,
        enum: Object.values(hairType) },
  skinType: { type: String ,
        enum: Object.values(skinType) },
  
    provider: {
      type: String,
      enum: Object.values(provider),
      default: provider.system,
    },
   
    
    phoneNumber: String,
    userType: {
      type: String,
      enum: Object.values(role),
    },
    completedQuizzes: {
        skin: { type: Boolean},
        hair: { type: Boolean }
      },
    isConfirmed: {type:Boolean,
      default:false
    },
    deletedAt: Date,
    bannedAt: Date,
    changeCredentialTime: Date,
    updatedBy: { type: String, ref: "user" },
    profileImage: {
      secure_url:{ type: String,default:"https://res.cloudinary.com/dkxcjklic/image/upload/v1747342532/istockphoto-1300845620-612x612_fi7wen.jpg"} ,
      public_id: { type: String,default:"default-image"},
    },
    OTP: [
      {
        code: { type: String, required: true },
        type: { type: String, enum: Object.values(OTPtypes), required: true },
        expiresIn: { type: Date },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isProfileCompleted: { type: Boolean},
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash({
      key: this.password,
      SALT_ROUND: process.env.SALT_ROUND,
    });
  }

  if (this.isModified("phoneNumber")) {
    this.phoneNumber = await encrypt({
      key: this.phoneNumber,
      SECRETE_KEY: process.env.SECRETE_KEY,
    });
  }

  next();
});


/* userSchema.post('findOne', async function(doc) {
  if (doc && doc.phoneNumber) {
    doc.phoneNumber =  decrypt({
      key: doc.phoneNumber,
      SECRETE_KEY: process.env.SECRETE_KEY,
    });
  }
})*/


userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await mongoose
      .model("chat")
      .updateMany({ parentId: this._id }, { isDeleted: true });
    next();
  }
);
userSchema.pre("findOneAndDelete", { document: true, query: false }, async function (next) {
  if (this.userType === role.Doctor) {
    await mongoose.model("doctor").deleteOne({ userId: this._id });
  }
  next();
});
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc?.userType === role.Pharmacist) {
    await mongoose.model("Pharmacy").deleteOne({ userId: doc._id });
  }
});
const userModel = mongoose.model.user || mongoose.model("user", userSchema);
export default userModel;
