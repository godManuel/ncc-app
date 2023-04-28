const asyncHandler = require("./async");

const notFound = asyncHandler(async (req, res, next) => {
  res.status(404).send("Page not found!");
});

module.exports = notFound;
