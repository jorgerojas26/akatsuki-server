import express from 'express';
const router = express.Router();

import controller from '../../controllers/task-guide-info.js';

router
  .route('/:task_title')
  .get(controller.GET_TASK_GUIDE_INFO_BY_TITLE)
  .patch(controller.UPDATE_TASK_GUIDE_INFO_BY_TITLE);

export default router;
