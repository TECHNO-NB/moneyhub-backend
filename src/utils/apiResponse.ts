class ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;

  constructor(success: boolean = true, status: number = 200, message: string = '', data?: T) {
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
