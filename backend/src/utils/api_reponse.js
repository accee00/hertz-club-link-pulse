class ApiResponse {
  constructor({
    statusCode,
    data = null,
    message = 'success',
    success = true,
  }) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

export { ApiResponse };
