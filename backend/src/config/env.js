const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  NEWSAPI_KEY: z.string().min(1, 'NEWSAPI_KEY is required'),
  FRONTEND_ORIGIN: z.string().url('FRONTEND_ORIGIN must be a valid URL'),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`\nInvalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

module.exports = parsed.data;
