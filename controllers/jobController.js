// backend/controllers/jobController.js
import asyncHandler from 'express-async-handler';
import Job          from '../models/Job.js';
import { clientOnly } from '../middleware/auth.js';

/* Helpers */
const ALLOWED_STATUS = ['open', 'in-progress', 'completed', 'cancelled'];
const populateClient = { path: 'client', select: 'name email' };

/* ───────── Client ▸ Create job ───────── */
export const createJob = asyncHandler(async (req, res) => {
  clientOnly(req, res, () => {});            // extra guard

  const {
    title, description, category,
    budget, deadline, location = '',
    requiredSkills = [], attachments = [],
  } = req.body;

  if (!title || !description || !category || !budget || !deadline) {
    res.status(400);
    throw new Error('Title, description, category, budget & deadline are required');
  }

  const job = await Job.create({
    client: req.user._id,
    title, description, category,
    budget, deadline, location,
    requiredSkills, attachments,
  });

  /* Real‑time broadcast */
  req.io.emit('job:new', job);

  res.status(201).json(job);
});

/* ───────── Public ▸ Get jobs list ───────── */
export const getJobs = asyncHandler(async (req, res) => {
  const {
    category, status, minBudget, maxBudget,
    skills, location, keyword,
    featured, page = 1, limit = 10,
  } = req.query;

  const q = {};

  /* Attribute filters */
  if (category) q.category = category;
  if (status)   q.status   = status;
  if (featured) q.isFeatured = featured === 'true';
  if (location) q.location = { $regex: location, $options: 'i' };
  if (keyword)  q.title    = { $regex: keyword,  $options: 'i' };

  /* Budget range */
  if (minBudget || maxBudget) {
    q.budget = {};
    if (minBudget) q.budget.$gte = Number(minBudget);
    if (maxBudget) q.budget.$lte = Number(maxBudget);
  }

  /* Skills (match all) */
  if (skills) {
    const arr = Array.isArray(skills) ? skills : skills.split(',');
    q.requiredSkills = { $all: arr.map((s) => s.trim()) };
  }

  /* Pagination */
  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(q)
       .populate('client', 'name')
       .sort('-createdAt')
       .skip(skip)
       .limit(Number(limit)),
    Job.countDocuments(q),
  ]);

  res.json({
    jobs,
    page : Number(page),
    totalPages: Math.ceil(total / limit),
    total,
  });
});

/* ───────── Public ▸ Get single job ───────── */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(populateClient);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json(job);
});

/* ───────── Client ▸ Update own job ───────── */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (req.user.role !== 'client' || job.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised');
  }

  const editable = [
    'title','description','category','budget','deadline',
    'location','requiredSkills','attachments',
  ];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) job[f] = req.body[f];
  });

  if (req.body.status && ALLOWED_STATUS.includes(req.body.status)) {
    job.status = req.body.status;
  }
  if (req.body.isFeatured !== undefined) {
    job.isFeatured = !!req.body.isFeatured;
  }

  const updated = await job.save();

  req.io.emit('job:update', updated);       // broadcast change
  res.json(updated);
});

/* ───────── Client ▸ Delete own job ───────── */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (req.user.role !== 'client' || job.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised');
  }
  await job.deleteOne();

  req.io.emit('job:delete', { _id: job._id });
  res.json({ message: 'Job removed' });
});

/* ───────── Client dashboard ▸ My jobs ───────── */
export const getMyJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== 'client') {
    res.status(403);
    throw new Error('Only clients can view their jobs');
  }
  const jobs = await Job.find({ client: req.user._id }).sort('-createdAt');
  res.json(jobs);
});
