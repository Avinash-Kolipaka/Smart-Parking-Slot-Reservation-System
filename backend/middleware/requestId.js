const { v4: uuidv4 } = require('uuid');

const requestIdMiddleware = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId; // Attach to request object
  res.setHeader('X-Request-ID', reqId); // Attach to response headers
  next();
};

module.exports = requestIdMiddleware;
