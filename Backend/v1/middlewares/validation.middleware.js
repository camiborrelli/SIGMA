export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      console.log(
        `Validation error for ${req.method} ${req.originalUrl}:`,
        error.details.map((d) => d.message),
      );
      const errors = {};
      error.details.forEach((d) => {
        const path =
          Array.isArray(d.path) && d.path.length ? d.path[0] : d.path;
        const key = typeof path === "string" ? path : String(path);
        if (errors[key]) errors[key] += ", " + d.message;
        else errors[key] = d.message;
      });
      return res.status(400).json({
        error: error.details.map((d) => d.message).join(", "),
        errors,
      });
    }
    req.body = value;
    next();
  };
}
