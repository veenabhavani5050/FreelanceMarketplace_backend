// controllers/jobController.js
import asyncHandler from "express-async-handler";
import Job from "../models/Job.js";

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Client)
export const createJob = asyncHandler(async (req, res) => {
  const { title, description, budget, deadline, category } = req.body;

  const job = new Job({
    client: req.user._id,
    title,
    description,
    budget,
    deadline,
    category,
  });

  const createdJob = await job.save();
  res.status(201).json(createdJob);
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("client", "name");
  res.json(jobs);
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("client", "name");
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json(job);
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Client)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job || job.client.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Job not found or unauthorized");
  }

  const { title, description, budget, deadline, category, status } = req.body;

  job.title = title || job.title;
  job.description = description || job.description;
  job.budget = budget || job.budget;
  job.deadline = deadline || job.deadline;
  job.category = category || job.category;
  job.status = status || job.status;

  const updatedJob = await job.save();
  res.json(updatedJob);
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Client)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job || job.client.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Job not found or unauthorized");
  }

  await job.deleteOne();
  res.json({ message: "Job deleted successfully" });
});
