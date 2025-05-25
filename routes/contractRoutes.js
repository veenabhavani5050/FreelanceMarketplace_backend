import express from "express";
import {
  createContract,
  getMyContracts,
  updateContract,
  getContractById,
} from "../controllers/contractController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes for contracts
router.route("/")
  .post(protect, createContract)     // Create a new contract
  .get(protect, getMyContracts);     // Get all contracts for the authenticated user

router.route("/:id")
  .get(protect, getContractById)     // Get a specific contract by ID
  .put(protect, updateContract);     // Update a contract by ID

export default router;
