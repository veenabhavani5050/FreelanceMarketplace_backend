import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URL = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const STRIPE_SECRET = process.env.STRIPE_SECRET;
