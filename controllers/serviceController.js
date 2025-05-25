import asyncHandler from "express-async-handler";
import Service from "../models/Service.js";

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Freelancer)
export const createService = asyncHandler(async (req, res) => {
  const { title, description, category, price, samples } = req.body;

  // Optionally validate input here

  const service = new Service({
    freelancer: req.user._id,
    title,
    description,
    category,
    price,
    samples,
  });

  const createdService = await service.save();
  res.status(201).json(createdService);
});

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find().populate("freelancer", "name");
  res.json(services);
});

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate("freelancer", "name");
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }
  res.json(service);
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Freelancer)
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  // Check ownership
  if (service.freelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this service");
  }

  const { title, description, category, price, samples } = req.body;

  service.title = title ?? service.title;
  service.description = description ?? service.description;
  service.category = category ?? service.category;
  service.price = price ?? service.price;
  service.samples = samples ?? service.samples;

  const updatedService = await service.save();
  res.json(updatedService);
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Freelancer)
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  // Check ownership
  if (service.freelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this service");
  }

  await service.deleteOne();
  res.json({ message: "Service removed" });
});
