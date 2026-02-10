const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 10*60 * 1000,
  max: 10000000000,
  message: "Too many requests from this IP, please try again later.",
});
