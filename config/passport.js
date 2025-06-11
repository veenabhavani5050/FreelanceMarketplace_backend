/* ───────── config/passport.js ───────── */
import passport, { Strategy as PassportStrategy } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv  from 'dotenv';
import User    from '../models/User.js';

dotenv.config();

/* ───── Google OAuth ───── */
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (_access, _refresh, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value;
          const existing = email ? await User.findOne({ email }) : null;

          if (existing) {
            existing.googleId = profile.id;
            await existing.save();
            user = existing;
          } else {
            user = await User.create({
              name:  profile.displayName,
              email,
              googleId: profile.id,
              role:  'client',                    // default
              profileImage: profile.photos?.[0]?.value,
            });
          }
        }
        return done(null, { _id: user._id });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ───── JWT strategy ───── */
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => req?.cookies?.token || null,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOpts, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      return user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

/* Session serialisation (Google only) */
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
