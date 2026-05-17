const { Router } = require('express');
const controller = require('../controllers/news.controller');
const validate = require('../middleware/validate.middleware');
const { headlinesSchema, searchSchema, sourcesSchema } = require('../schemas/news.schema');

const router = Router();

router.get('/headlines', validate(headlinesSchema), controller.headlines);
router.get('/search', validate(searchSchema), controller.search);
router.get('/sources', validate(sourcesSchema), controller.sources);

module.exports = router;
