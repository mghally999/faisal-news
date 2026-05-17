const { Router } = require('express');
const authRoutes = require('./auth.routes');
const newsRoutes = require('./news.routes');
const savedRoutes = require('./saved.routes');

const router = Router();

router.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
router.use('/auth', authRoutes);
router.use('/news', newsRoutes);
router.use('/saved', savedRoutes);

module.exports = router;
