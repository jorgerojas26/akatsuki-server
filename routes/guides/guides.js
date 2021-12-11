import express from "express";
const router = express.Router();

import controller from "../../controllers/guides.js";

router.route("/").get(controller.GET_ALL_GUIDES).post(controller.CREATE_GUIDE);

router
  .route("/:id")
  .patch(controller.UPDATE_GUIDE)
  .delete(controller.DELETE_GUIDE);

export default router;
