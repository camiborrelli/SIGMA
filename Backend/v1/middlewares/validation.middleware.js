export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message).join(", ") });
    }
    req.body = value;
    next();
  };
}
