import express from 'express';
const router = express.Router();

import controller from '../../controllers/include-list.js';

router.route('/').get(controller.GET_INCLUDE_LIST).post(controller.CREATE_INCLUDE_LIST_ITEM);

router.route('/:id').patch(controller.UPDATE_INCLUDE_LIST).delete(controller.DELETE_INCLUDE_LIST_ITEM);

export default router;
