const { z } = require('zod');

const pagination = {
  page: z.coerce.number().int().min(1).max(100).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
};

const headlinesSchema = z.object({
  query: z.object({
    country: z.string().trim().length(2).toLowerCase().default('us'),
    category: z
      .enum(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'])
      .optional(),
    ...pagination
  })
});

const searchSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1, 'q is required').max(200),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    sortBy: z.enum(['relevancy', 'popularity', 'publishedAt']).default('publishedAt'),
    ...pagination
  })
});

const sourcesSchema = z.object({
  query: z.object({
    category: z
      .enum(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'])
      .optional(),
    country: z.string().trim().length(2).toLowerCase().optional()
  })
});

module.exports = { headlinesSchema, searchSchema, sourcesSchema };
