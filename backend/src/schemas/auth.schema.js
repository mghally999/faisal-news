const { z } = require('zod');

const emailField = z.string().trim().toLowerCase().email('Invalid email');
const passwordField = z.string().min(8, 'Password must be at least 8 characters').max(128);

const registerSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
    name: z.string().trim().min(1).max(80).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string().min(1)
  })
});

module.exports = { registerSchema, loginSchema };
