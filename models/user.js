/* ───────── models/User.js ───────── */
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import crypto   from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name : { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    googleId: { type: String, default: null },

    role: {
      type: String,
      enum: ['freelancer', 'client', 'admin'],
      required: true,
    },

    profileImage: { type: String, default: '' },
    phone   : { type: String, default: '' },
    location: { type: String, default: '' },

    profile: {
      skills      : [String],
      portfolio   : [{ title: String, url: String }],
      availability: {
        type: String,
        enum: ['full-time', 'part-time', 'freelance'],
        default: 'freelance',
      },
      bio            : { type: String, maxlength: 500 },
      experience     : String,
      languages      : [String],
      companyName    : String,
      businessDetails: String,
    },

    rating: { type: Number, default: 0 },

    passwordResetToken  : String,
    passwordResetExpires: Date,

    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* Hash password if modified & present */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* Instance methods */
userSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const raw  = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return raw;
};

export default mongoose.model('User', userSchema);
