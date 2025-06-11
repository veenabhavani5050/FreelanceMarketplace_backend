// middleware/logger.js
/* Simple dev‑time request logger (disabled in production) */
const logger = (req, _res, next) => {
  if (process.env.NODE_ENV === 'production') return next();

  try {
    console.log('――― Incoming Request ―――');
    console.log(` ${req.method} ${req.originalUrl}`);
    console.log(' Headers:', safe(req.headers));
    if (Object.keys(req.body || {}).length)   console.log(' Body   :', safe(req.body));
    if (Object.keys(req.query || {}).length)  console.log(' Query  :', safe(req.query));
    if (Object.keys(req.params || {}).length) console.log(' Params :', safe(req.params));
    console.log(` Time   : ${new Date().toISOString()}`);
    console.log('─────────────────────────\n');
  } catch (e) {
    console.error('Logger error:', e.message);
  }
  next();
};

const safe = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '[unserializable]';
  }
};

export default logger;
