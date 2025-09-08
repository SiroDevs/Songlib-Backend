import { Response } from "express";

export class ResponseUtils {
  static success(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json(data);
  }

  static error(res: Response, message: string, statusCode: number = 500, details?: any) {
    return res.status(statusCode).json({
      error: message,
      ...(details && { details })
    });
  }

  static notFound(res: Response, message: string = "Resource not found") {
    return res.status(404).json({ error: message });
  }

  static badRequest(res: Response, message: string = "Bad request") {
    return res.status(400).json({ error: message });
  }

  static conflict(res: Response, message: string = "Conflict") {
    return res.status(409).json({ error: message });
  }

  static bulkOperationResult(
    res: Response,
    operation: string,
    results: any[],
    errors: any[],
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      message: `${operation} completed`,
      [operation.toLowerCase() + 'ed']: results.length,
      failed: errors.length,
      data: results,
      ...(errors.length > 0 && { errors })
    });
  }
}