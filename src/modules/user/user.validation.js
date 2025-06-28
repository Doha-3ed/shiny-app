import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";
import { role } from "../../utilities/Enums.js";

//----------------------------------------------------------signUpSchema----------------------------------------------------------------------------
export const signUpSchema = {
    body: Joi.object({
      name: Joi.string().min(3).max(30).required(),
  
      password: generalRules.password.required(),
      confirmPassword: Joi.valid(Joi.ref("password")).required(),
  
      phoneNumber: Joi.string()
        .pattern(/^[+]?[0-9]{10,15}$/)
        .required(),
      email: generalRules.email.required(),
     userType:Joi.string()
     .valid(...Object.values(role))
     .optional(),
    })}
//----------------------------------------------------------roleBasedSchemaSchema----------------------------------------------------------------------------
export const RoleBasedSchema = {
  User: signUpSchema.body.concat(
    Joi.object({
      location: Joi.string()
    })
  ),
  Doctor: signUpSchema.body.concat(
    Joi.object({
      specialization: Joi.string().required(),
      licenseNumber: Joi.string().required(),
      clinicName: Joi.string().required(),
      clinicLocation: Joi.string().required(),
      clinicPhone: Joi.string().required(),
      experience: Joi.string().optional(),
    })
  ).concat(
    Joi.object({
      certificate: generalRules.file.optional(), // corresponds to req.file (i.e., certificate)
    })
  ),
  Pharmacist: signUpSchema.body.concat(
    Joi.object({
      licenseNumber: Joi.string().required(),
      location:Joi.string().required()
    })
  )
};
  export const validateSignup = (req, res, next) => {
    const { userType } = req.body;
    const schema = RoleBasedSchema[userType] || RoleBasedSchema.User;
  
    const dataToValidate = {
      ...req.body,
      ...(req.body.userType === role.Doctor && { certificate: req.file }),
    };
    
    const { error } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
    });
  
    if (error) {
      return res.status(400).json({
        msg: "Validation Error",
        errors: error.details.map((detail) => detail.message),
      });
    }
  
    next();
  };
  //----------------------------------------------------------confirmEmailSchema----------------------------------------------------------------------------
export const confirmEmailSchema = {
    body: Joi.object({
      email: generalRules.email.required(),
      code: Joi.string().length(4).required(),
    }),
  };
  //----------------------------------------------------------logInSchema----------------------------------------------------------------------------
export const loginSchema = {
    body: Joi.object({
      email: generalRules.email.required(),
      password: generalRules.password.required(),
    }),
  };
  //----------------------------------------------------------signUpWithGoogleSchema----------------------------------------------------------------------------
  export const signUpWithGoogleSchema = {
    body: Joi.object({
      idToken: Joi.string().required(),
    }),
  };
  //----------------------------------------------------------logInWithGoogleSchema----------------------------------------------------------------------------
export const logInWithGoogleSchema = {
  body: Joi.object({
    idToken: Joi.string().required(),
  })
}

/*export const googleLoginBaseSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "string.empty": "idToken is required",
    }),
    userType: Joi.string()
      .valid(...Object.values(role))
      .optional(),
  }),
};
  export const logInWithGoogleSchema = {
    User: googleLoginBaseSchema.body.concat(
      Joi.object({
        // Optional, if you want to extend in future
      })
    ),
    Doctor: googleLoginBaseSchema.body.concat(
      Joi.object({
        specialization: Joi.string().required(),
        licenseNumber: Joi.string().required(),
        clinicName: Joi.string().required(),
        clinicLocation: Joi.string().required(),
        clinicPhone: Joi.string().required(),
        experience: Joi.string().optional(),
      })
    ),
    Pharmacist: googleLoginBaseSchema.body.concat(
      Joi.object({
        licenseNumber: Joi.string().required(),
        location: Joi.string().required(),
      })
    ),
  };

export const validateGoogleLogin = (req, res, next) => {
  const { userType } = req.body;
  const schema = logInWithGoogleSchema[userType] || logInWithGoogleSchema.User;

  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      msg: "Validation Error",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};*/
  //----------------------------------------------------------forgetPasswordSchema----------------------------------------------------------------------------
export const forgetPasswordSchema = {
    body: Joi.object({
      email: generalRules.email.required(),
    }),
  };
  
  //----------------------------------------------------------resetPasswordSchema----------------------------------------------------------------------------
  export const confirmPasswordSchema = {
    body: Joi.object({
      email: generalRules.email.required(),
      code: Joi.string().required(),
      
    }),
  };
  export const resetPasswordSchema = {
    body: Joi.object({
      email: generalRules.email.required(),
     
      newPassword: generalRules.password.required(),
      confirmPassword: Joi.valid(Joi.ref("newPassword")).required(),
    }),
  };
  //----------------------------------------------------------getAccountSchema----------------------------------------------------------------------------
export const getAccountSchema = {
    headers: generalRules.headers.required(),
  };
  //----------------------------------------------------------uploadProfilePicSchema----------------------------------------------------------------------------
export const uploadProfilePicSchema = {
    file: generalRules.file.optional(),
  
    headers: generalRules.headers.required(),
  };
  //----------------------------------------------------------deletePicSchema----------------------------------------------------------------------------
export const deletePicSchema = {
    headers: generalRules.headers.required(),
  };
  //----------------------------------------------------------softDeleteSchema----------------------------------------------------------------------------
export const softDeleteSchema = {
    headers: generalRules.headers.required(),
  };
  //----------------------------------------------------------bannSchema----------------------------------------------------------------------------
export const bannSchema = {
  params: Joi.object({
    userId: generalRules.id.required(),
  }).required(),
  headers: generalRules.headers.required(),
};
//------------------------------------------------chooseTypeSchema----------------------------------------------------------------------------
export const chooseHairTypeSchema = {
  body: Joi.object({
   hairType: Joi.string() .valid("Straight Hair", "Wavy Hair", "Curly Hair", "Coily Hair").optional(),
   userId: generalRules.id.required(),  
  })
};

export const chooseSkinTypeSchema = {
  body: Joi.object({
   skinType: Joi.string() .valid("Normal Skin",
"Oily Skin",
"Dry Skin",
"Combination Skin",
"Sensitive Skin").optional(),
   userId: generalRules.id.required(),  
  })
};
  