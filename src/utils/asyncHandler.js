// src/utils/asyncHandler.js
// Wraps an async route handler so rejected promises reach Express's error middleware
// instead of needing a try/catch in every route.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
