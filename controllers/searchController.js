// controllers/searchController.js
import asyncHandler from 'express-async-handler';
import User    from '../models/User.js';
import Job     from '../models/Job.js';
import Service from '../models/Service.js';

/* -------------------------- helper -------------------------- */
const buildFilters = (qp, isJob = true) => {
  const keyword = qp.keyword ?? qp.q ?? '';
  const {
    category,
    minBudget, maxBudget,
    minPrice,  maxPrice,
  } = qp;

  const query = {};

  /* text search */
  if (keyword) {
    query.title = { $regex: keyword, $options: 'i' };
  }

  /* category */
  if (category) query.category = category;

  /* price / budget */
  const amtField = isJob ? 'budget' : 'price';
  const min = isJob ? minBudget : minPrice;
  const max = isJob ? maxBudget : maxPrice;

  if (min || max) {
    query[amtField] = {};
    if (min) query[amtField].$gte = Number(min);
    if (max) query[amtField].$lte = Number(max);
  }

  return query;
};

/* ------------------ A) freelancers ------------------ */
export const searchFreelancers = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword ?? req.query.q ?? '';
  const page  = +req.query.page  || 1;
  const limit = +req.query.limit || 10;
  const sort  = req.query.sort || '-createdAt';

  const query = {
    role: 'freelancer',
    ...(keyword && {
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { 'profile.skills': { $regex: keyword, $options: 'i' } },
        { 'profile.bio':    { $regex: keyword, $options: 'i' } },
      ],
    }),
  };

  const total = await User.countDocuments(query);
  const freelancers = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({ total, page, pages: Math.ceil(total / limit), freelancers });
});

/* ------------------ B) jobs ------------------ */
export const searchJobs = asyncHandler(async (req, res) => {
  const page  = +req.query.page  || 1;
  const limit = +req.query.limit || 10;
  const sort  = req.query.sort || '-createdAt';

  const query = buildFilters(req.query, true);

  const total = await Job.countDocuments(query);
  const jobs  = await Job.find(query)
    .populate('client', 'name')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({ total, page, pages: Math.ceil(total / limit), jobs });
});

/* ------------------ C) services ------------------ */
export const searchServices = asyncHandler(async (req, res) => {
  const page  = +req.query.page  || 1;
  const limit = +req.query.limit || 10;
  const sort  = req.query.sort || '-createdAt';

  const query = buildFilters(req.query, false);

  const total    = await Service.countDocuments(query);
  const services = await Service.find(query)
    .populate('freelancer', 'name')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({ total, page, pages: Math.ceil(total / limit), services });
});

/* ------------------ D) generic wrapper ------------------ */
export const searchDispatcher = asyncHandler(async (req, res, next) => {
  const type = (req.query.type || 'freelancers').toLowerCase();

  if (type === 'freelancers') return searchFreelancers(req, res, next);
  if (type === 'jobs')        return searchJobs(req, res, next);
  if (type === 'services')    return searchServices(req, res, next);

  res.status(400).json({ message: 'Invalid type parameter' });
});
