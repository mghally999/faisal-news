const asyncHandler = require('../utils/asyncHandler');
const newsService = require('../services/news.service');

const headlines = asyncHandler(async (req, res) => {
  const data = await newsService.headlines(req.validatedQuery);
  res.status(200).json({ data });
});

const search = asyncHandler(async (req, res) => {
  const data = await newsService.search(req.validatedQuery);
  res.status(200).json({ data });
});

const sources = asyncHandler(async (req, res) => {
  const data = await newsService.sources(req.validatedQuery);
  res.status(200).json({ data });
});

module.exports = { headlines, search, sources };
