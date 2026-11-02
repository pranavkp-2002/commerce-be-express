// Operational error with an HTTP status. `details` is merged into the JSON response.
class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = AppError;
