import express from 'express';
const router = express.Router();

import controller from '../../controllers/include-list.js';

export default function (io) {
  router
    .route('/')
    .get(controller.GET_INCLUDE_LIST)
    .post((req, res) => controller.CREATE_INCLUDE_LIST_ITEM(req, res, io));

  router
    .route('/:id')
    .patch((req, res) => controller.UPDATE_INCLUDE_LIST(req, res, io))
    .delete((req, res) => controller.DELETE_INCLUDE_LIST_ITEM(req, res, io));
}

export { router };
