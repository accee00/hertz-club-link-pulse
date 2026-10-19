export function sendResponse(res, apiResponse) {
  return res.status(apiResponse.statusCode).json(apiResponse.toJSON());
}

export function sendError(res, error) {
  return res.status(error.statusCode || 500).json(error.toJSON());
}
