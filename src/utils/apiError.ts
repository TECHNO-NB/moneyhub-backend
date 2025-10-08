class ApiError extends Error {
  success: boolean;
  statusCode: number;
  errors?: any[];
  stack?: string;

  constructor(
    success: boolean = false,
    statusCode: number = 400,
    message: string = 'Something went wrong',
    stack?: string,
    errors: any[] = []
  ) {
    super(message);
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
