const { Router } = require('express');
const controller = require('../controllers/saved.controller');
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  createSavedSchema,
  updateSavedSchema,
  idParamSchema,
  listSavedSchema
} = require('../schemas/saved.schema');

const router = Router();

router.use(requireAuth);
router.get('/', validate(listSavedSchema), controller.list);
router.post('/', validate(createSavedSchema), controller.create);
router.get('/:id', validate(idParamSchema), controller.getOne);
router.patch('/:id', validate(updateSavedSchema), controller.update);
router.delete('/:id', validate(idParamSchema), controller.remove);

module.exports = router;
