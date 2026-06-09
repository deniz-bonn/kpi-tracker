// Wraps async route handlers so Express catches rejections
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
