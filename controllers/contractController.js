import asyncHandler from "express-async-handler";
import Contract from "../models/Contract.js";

// Create new contract
export const createContract = asyncHandler(async (req, res) => {
  const { job, freelancer, title, totalAmount, milestones } = req.body;

  const contract = new Contract({
    job,
    client: req.user._id,
    freelancer,
    title,
    totalAmount,
    milestones,
  });

  const createdContract = await contract.save();
  res.status(201).json(createdContract);
});

// Get contracts for logged-in user
export const getMyContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({
    $or: [{ client: req.user._id }, { freelancer: req.user._id }],
  })
    .populate("job", "title")
    .populate("freelancer", "name")
    .populate("client", "name");

  res.json(contracts);
});

// Update contract status or milestones
export const updateContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Authorization: Only client or freelancer involved should update
  if (
    contract.client.toString() !== req.user._id.toString() &&
    contract.freelancer.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to update this contract");
  }

  const { status, milestones } = req.body;

  if (status) contract.status = status;
  if (milestones) contract.milestones = milestones;

  const updated = await contract.save();
  res.json(updated);
});

// Get single contract
export const getContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id)
    .populate("job")
    .populate("client", "name email")
    .populate("freelancer", "name email");

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Authorization: Only client or freelancer involved can view
  if (
    contract.client.toString() !== req.user._id.toString() &&
    contract.freelancer.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this contract");
  }

  res.json(contract);
});
