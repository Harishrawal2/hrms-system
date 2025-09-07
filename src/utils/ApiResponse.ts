export class ApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: any, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export const sendResponse = (res: any, statusCode: number, data: any, message = 'Success') => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};