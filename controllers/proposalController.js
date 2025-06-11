/* controllers/proposalController.js */
import asyncHandler from 'express-async-handler';
import Proposal  from '../models/Proposal.js';
import Job       from '../models/Job.js';
import Contract  from '../models/Contract.js';

/* ─────────── 1. Submit proposal  ─────────── */
export const submitProposal = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter, proposedBudget, expectedDuration } = req.body;

  const job = await Job.findById(jobId);
  if (!job || job.status !== 'open') {
    res.status(400);
    throw new Error('Job not found or not open');
  }
  if (job.client.equals(req.user._id)) {
    res.status(400);
    throw new Error('Clients cannot bid on their own jobs');
  }

  const proposal = await Proposal.create({
    job  : jobId,
    freelancer: req.user._id,
    coverLetter,
    proposedBudget,
    expectedDuration,
  });

  /* 🔔 notify the client */
  req.io.to(job.client.toString()).emit('proposal:new', proposal);

  res.status(201).json(proposal);
});

/* ─────────── 2. Client ▸ list proposals on a job ─────────── */
export const getProposalsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (!job.client.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorised');
  }

  const proposals = await Proposal.find({ job: job._id })
    .populate('freelancer', 'name email profile')
    .sort('-createdAt');

  res.json(proposals);
});

/* ─────────── 3. Freelancer ▸ my proposals ─────────── */
export const getMyProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({ freelancer: req.user._id })
    .populate('job', 'title status')
    .sort('-createdAt');

  res.json(proposals);
});

/* ─────────── 4. Client responds (accept / reject) ─────────── */
export const respondToProposal = asyncHandler(async (req, res) => {
  const { status } = req.body;                       // accepted | rejected
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be accepted or rejected');
  }

  const proposal = await Proposal.findById(req.params.id).populate('job');
  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }
  if (!proposal.job.client.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorised');
  }
  if (proposal.status !== 'pending') {
    res.status(400);
    throw new Error(`Proposal already ${proposal.status}`);
  }

  proposal.status = status;
  await proposal.save();

  if (status === 'accepted') {
    const contract = await Contract.create({
      job        : proposal.job._id,
      client     : proposal.job.client,
      freelancer : proposal.freelancer,
      title      : proposal.job.title,
      totalAmount: proposal.proposedBudget,
      status     : 'active',
      milestones : [],
    });

    /* notify freelancer */
    req.io.to(proposal.freelancer.toString()).emit('contract:new', contract);
  }

  res.json(proposal);
});
