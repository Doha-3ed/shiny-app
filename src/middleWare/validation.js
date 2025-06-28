import Joi from "joi";

export const validation = (schema) => {
    return (req, res, next) => {
      const validationResult = [];
      for (const key of Object.keys(schema)) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
  
        if (error) {
          validationResult.push({
            key,
            errors: error.details.map((detail) => detail.message),
          });
        }
      }
      if (validationResult.length > 0) {
        return res.status(400).json({
          msg: "Validation Error",
          errors: validationResult,
        });
      }
  
      next();
    };
  };
  