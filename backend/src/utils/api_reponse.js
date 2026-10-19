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

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }
}

export { ApiResponse };
