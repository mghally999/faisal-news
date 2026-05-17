const { z } = require('zod');

const createSavedSchema = z.object({
  body: z.object({
    articleUrl: z.string().url(),
    title: z.string().trim().min(1).max(400),
    description: z.string().trim().max(2000).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    source: z.string().trim().max(120).optional().nullable(),
    publishedAt: z.string().datetime().optional().nullable(),
    notes: z.string().trim().max(4000).optional().nullable()
  })
});

const updateSavedSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    notes: z.string().trim().max(4000).optional().nullable()
  })
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

const listSavedSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(100).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20)
  })
});

module.exports = { createSavedSchema, updateSavedSchema, idParamSchema, listSavedSchema };
