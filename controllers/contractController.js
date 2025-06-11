/* controllers/contractController.js */
import asyncHandler from 'express-async-handler';
import Contract from '../models/Contract.js';

/* Role filter helper */
const roleFilter = (role, id) =>
  role === 'client'
    ? { client: id }
    : role === 'freelancer'
    ? { freelancer: id }
    : {};

/* ───── 1. Create contract (client) ───── */
export const createContract = asyncHandler(async (req, res) => {
  const {
    freelancer, job, title, description = '',
    milestones = [], totalAmount,
  } = req.body;

  const contract = await Contract.create({
    job, client: req.user._id, freelancer,
    title, description, milestones, totalAmount,
  });

  req.io.to(freelancer).emit('contract:new', contract);

  res.status(201).json(contract);
});

/* ───── 2. Lists ───── */
export const listContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find(roleFilter(req.user.role, req.user._id))
    .populate('client freelancer', 'name email')
    .sort('-createdAt');

  res.json(contracts);
});

/* Lists restricted to role dashboards */
export const listClientContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({ client: req.user._id })
    .populate('freelancer', 'name email')
    .sort('-createdAt');
  res.json(contracts);
});

export const listFreelancerContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({ freelancer: req.user._id })
    .populate('client', 'name email')
    .sort('-createdAt');
  res.json(contracts);
});

/* ───── 3. Get single ───── */
export const getContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id)
    .populate('client freelancer', 'name email');
  if (!contract) {
    res.status(404);
    throw new Error('Contract not found');
  }

  const allowed =
    req.user.role === 'admin' ||
    contract.client.equals(req.user._id) ||
    contract.freelancer.equals(req.user._id);

  if (!allowed) {
    res.status(403);
    throw new Error('Not authorised');
  }

  res.json(contract);
});

/* ───── 4. Update contract (client / admin) ───── */
export const updateContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  if (!contract) {
    res.status(404);
    throw new Error('Contract not found');
  }

  const allowed =
    req.user.role === 'admin' || contract.client.equals(req.user._id);
  if (!allowed) {
    res.status(403);
    throw new Error('Not authorised');
  }

  const { title, description, totalAmount, status } = req.body;
  if (title)         contract.title       = title;
  if (description)   contract.description = description;
  if (totalAmount)   contract.totalAmount = totalAmount;
  if (status && ['completed', 'cancelled'].includes(status)) {
    contract.status = status;
  }

  const updated = await contract.save();
  res.json(updated);
});

/* ───── 5. Update milestone status ───── */
export const updateMilestoneStatus = asyncHandler(async (req, res) => {
  const { id, milestoneId } = req.params;
  const { status } = req.body; // pending | in progress | completed | paid

  const allowedStatus = ['pending', 'in progress', 'completed', 'paid'];
  if (!allowedStatus.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const contract = await Contract.findById(id);
  if (!contract) {
    res.status(404);
    throw new Error('Contract not found');
  }

  const allowed =
    req.user.role === 'admin' ||
    contract.client.equals(req.user._id) ||
    contract.freelancer.equals(req.user._id);
  if (!allowed) {
    res.status(403);
    throw new Error('Not authorised');
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found');
  }

  milestone.status = status;
  await contract.save();

  res.json(milestone);
});
