const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.slice(1).join('.') || 'input'}: ${i.message}`)
      .join('; ');
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
  }
  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.validatedQuery = result.data.query;
  if (result.data.params) req.params = result.data.params;
  next();
};

module.exports = validate;
