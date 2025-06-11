/* controllers/milestoneController.js */
import asyncHandler from 'express-async-handler';
import Milestone from '../models/Milestone.js';
import Contract  from '../models/Contract.js';

/* ───── 1. Create milestone (client) ───── */
export const createMilestone = asyncHandler(async (req, res) => {
  const { contractId, title, description = '', amount, dueDate } = req.body;

  const contract = await Contract.findById(contractId);
  if (!contract) {
    res.status(404);
    throw new Error('Contract not found');
  }
  if (!contract.client.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only client can add milestones');
  }

  /* embed */
  const embedded = contract.milestones.create({ title, amount, dueDate });
  contract.milestones.push(embedded);
  await contract.save();

  /* separate doc for global view */
  const milestone = await Milestone.create({
    contractId,
    title,
    description,
    amount,
    dueDate,
  });

  req.io.to(contract.freelancer.toString()).emit('milestone:new', milestone);

  res.status(201).json(milestone);
});

/* ───── 2. Milestones by contract ───── */
export const getMilestonesByContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.contractId);
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

  const milestones = await Milestone.find({ contractId: contract._id }).sort('dueDate');
  res.json(milestones);
});

/* ───── 3. Logged‑in user’s milestones ───── */
export const getMyMilestones = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'client'
      ? { client: req.user._id }
      : req.user.role === 'freelancer'
      ? { freelancer: req.user._id }
      : {};

  const contracts = await Contract.find(filter).select('_id');
  const ids = contracts.map((c) => c._id);

  const milestones = await Milestone.find({ contractId: { $in: ids } })
    .populate({ path: 'contractId', select: 'title client freelancer' })
    .sort('dueDate');

  res.json(milestones);
});

/* ───── 4. Release milestone (mark paid) ───── */
export const releaseMilestone = asyncHandler(async (req, res) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found');
  }

  const contract = await Contract.findById(milestone.contractId);
  if (!contract) {
    res.status(404);
    throw new Error('Parent contract missing');
  }
  const allowed =
    req.user.role === 'admin' || contract.client.equals(req.user._id);
  if (!allowed) {
    res.status(403);
    throw new Error('Not authorised');
  }
  if (milestone.status !== 'completed') {
    res.status(400);
    throw new Error('Milestone must be completed first');
  }

  milestone.status = 'paid';
  milestone.isPaid = true;
  await milestone.save();

  const embedded = contract.milestones.id(milestone._id);
  if (embedded) {
    embedded.status = 'paid';
    await contract.save();
  }

  req.io.to(contract.freelancer.toString()).emit('milestone:paid', milestone);

  res.json(milestone);
});
