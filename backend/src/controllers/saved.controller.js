const asyncHandler = require('../utils/asyncHandler');
const savedModel = require('../models/savedArticle.model');
const { HttpError } = require('../middleware/error.middleware');

const list = asyncHandler(async (req, res) => {
  const { page, pageSize } = req.validatedQuery;
  const [items, total] = await savedModel.listByUser({ userId: req.user.id, page, pageSize });
  res.status(200).json({ data: { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
});

const getOne = asyncHandler(async (req, res) => {
  const item = await savedModel.findOwned({ userId: req.user.id, id: req.params.id });
  if (!item) throw new HttpError(404, 'NOT_FOUND', 'Saved article not found');
  res.status(200).json({ data: item });
});

const create = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : null,
    userId: req.user.id
  };
  try {
    const item = await savedModel.create(payload);
    res.status(201).json({ data: item });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'ALREADY_SAVED', 'Article already saved');
    }
    throw err;
  }
});

const update = asyncHandler(async (req, res) => {
  const result = await savedModel.updateNotes({
    id: req.params.id,
    userId: req.user.id,
    notes: req.body.notes ?? null
  });
  if (result.count === 0) throw new HttpError(404, 'NOT_FOUND', 'Saved article not found');
  const item = await savedModel.findOwned({ userId: req.user.id, id: req.params.id });
  res.status(200).json({ data: item });
});

const remove = asyncHandler(async (req, res) => {
  const result = await savedModel.remove({ userId: req.user.id, id: req.params.id });
  if (result.count === 0) throw new HttpError(404, 'NOT_FOUND', 'Saved article not found');
  res.status(204).end();
});

module.exports = { list, getOne, create, update, remove };
