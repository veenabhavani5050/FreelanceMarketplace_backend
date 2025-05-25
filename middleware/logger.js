const logger = (req, res, next) => {
  console.log(`Request Method: ${req.method}`);
  console.log(`Request URL: ${req.originalUrl}`); // use originalUrl for full path including query string
  console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
  
  // Safely stringify body, params, query, cookies, if they exist
  console.log(`Request Body: ${JSON.stringify(req.body || {})}`);
  console.log(`Request Params: ${JSON.stringify(req.params || {})}`);
  console.log(`Request Query: ${JSON.stringify(req.query || {})}`);
  console.log(`Request Cookies: ${JSON.stringify(req.cookies || {})}`);
  
  console.log(`Request Time: ${new Date().toISOString()}`); // ISO string is better for logs
  
  console.log('--------------------------------------');
  next();
};

export default logger;
