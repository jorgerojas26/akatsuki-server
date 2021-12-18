import express from 'express';
const router = express.Router();

import controller from '../../controllers/guides.js';

router.route('/').get(controller.GET_ALL_GUIDES).post(controller.CREATE_GUIDE);
router.route('/needed/:task_title').get(controller.GET_ALL_NEEDED_INFO);

router
  .route('/:id')
  .get(controller.GET_GUIDE_BY_ID)
  .patch(controller.UPDATE_GUIDE)
  .delete(controller.DELETE_GUIDE)
  .post(controller.ADD_ITEM_TO_GUIDE);

export default router;
