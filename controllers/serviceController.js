// backend/controllers/serviceController.js
import asyncHandler from 'express-async-handler';
import Service      from '../models/Service.js';

/* ───────── Freelancer ▸ Create service ───────── */
export const createService = asyncHandler(async (req, res) => {
  if (req.user.role !== 'freelancer') {
    res.status(403);
    throw new Error('Only freelancers can create services');
  }
  const { title, description, category, price, images } = req.body;
  if (!title || !price) {
    res.status(400);
    throw new Error('Title & price are required');
  }

  const service = await Service.create({
    freelancer: req.user._id,
    title,
    description,
    category,
    price,
    images: images || [],
  });

  req.io.to(req.user._id.toString()).emit('service:new', service);
  res.status(201).json(service);
});

/* ───────── Public ▸ Get services list ───────── */
export const getAllServices = asyncHandler(async (req, res) => {
  const {
    category, minPrice, maxPrice,
    freelancer, page = 1, limit = 12, sort = '-createdAt',
  } = req.query;

  const q = { availability: true };
  if (category)    q.category = category;
  if (freelancer)  q.freelancer = freelancer;
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
  }

  const skip = (page - 1) * limit;
  const [services, total] = await Promise.all([
    Service.find(q)
      .populate('freelancer', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Service.countDocuments(q),
  ]);

  res.json({
    services,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    total,
  });
});

/* ───────── Public ▸ Get single service ───────── */
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
                               .populate('freelancer', 'name');
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  res.json(service);
});

/* ───────── Freelancer ▸ Update own service ───────── */
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  if (service.freelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised to update this service');
  }

  const fields = ['title','description','category','price','images','availability'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) service[f] = req.body[f];
  });

  const updated = await service.save();
  req.io.to(req.user._id.toString()).emit('service:update', updated);
  res.json(updated);
});

/* ───────── Freelancer ▸ Delete own service ───────── */
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  if (service.freelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised to delete this service');
  }
  await service.deleteOne();

  req.io.to(req.user._id.toString()).emit('service:delete', { _id: service._id });
  res.json({ message: 'Service removed' });
});

/* ───────── Freelancer dashboard ▸ My services ───────── */
export const getMyServices = asyncHandler(async (req, res) => {
  if (req.user.role !== 'freelancer') {
    res.status(403);
    throw new Error('Only freelancers can view their services');
  }
  const services = await Service.find({ freelancer: req.user._id })
                                .sort('-createdAt');
  res.json(services);
});
