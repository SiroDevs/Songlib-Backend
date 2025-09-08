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

  static recordsError(res: Response, error: any) {
    if (error.code === 11000) {
      this.conflict(res, "Duplicate record found");
    } else {
      this.error(res, "Internal server error");
    }
  }

  static bulkOperationResult(
    res: Response,
    operation: string,
    results: any[],
    errors: any[],
    statusCode: number = 200
  ) {
    if (errors.length === 0) {
      return res.status(statusCode).json(results);
    }

    return res.status(statusCode).json({
      message: `${operation} completed with errors`,
      results,
      errors
    });
  }
}