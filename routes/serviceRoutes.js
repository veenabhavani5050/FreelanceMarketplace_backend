import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getAllServices)
  .post(protect, createService);

router.route("/:id")
  .get(getServiceById)
  .put(protect, updateService)
  .delete(protect, deleteService);

export default router;
