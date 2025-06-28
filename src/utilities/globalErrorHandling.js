export const asyncHandler = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch((err) => {
        return next(err);
      });
    };
  };
  export const errorHandling = (err, req, res, next) => {
    return res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  };
  