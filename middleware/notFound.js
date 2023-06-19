import asyncHandler from "./async.js";

const notFound = asyncHandler(async (req, res, next) => {
  res.status(404).send("Page not found!");
});

export default notFound;
