// Wraps async route handlers so rejected promises reach the error middleware
// instead of needing a try/catch block in every controller function.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
