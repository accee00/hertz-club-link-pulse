class ApiError extends Error {
  constructor({
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = '',
    success = false,
    data = null,
  } = {}) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.success = success;
    this.errors = errors;
    this.data = data;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
