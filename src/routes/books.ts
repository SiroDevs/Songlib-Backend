import { Router, Request, Response, NextFunction } from "express";
import { BookService } from "../services/bookService";
import { ResponseUtils } from "../utils/responseUtils";
import { ValidationUtils } from "../utils/validationUtils";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await BookService.getAllBooks();
    ResponseUtils.success(res, books);
  } catch (error) {
    ResponseUtils.recordsError(res, error);
    console.error(error);
    next(error);
  }
});

/**
 * GET single book or multiple books by IDs
 */
router.get("/:ids", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookIds = req.params.ids.split(",");
    const books = await BookService.getBooksByIds(bookIds);
    return ResponseUtils.success(res, books);
  } catch (error) {
    ResponseUtils.recordsError(res, error);
    console.error(error);
    next(error);
  }
});

/**
 * POST new book(s)
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (ValidationUtils.isBulkOperation(req.body)) {
      const { createdBooks, errors } = await BookService.createMultipleBooks(req.body);

      return ResponseUtils.bulkOperationResult(
        res,
        "books saved",
        createdBooks,
        errors,
        201
      );
    } else {
      const validationError = ValidationUtils.validateBookData(req.body);
      if (validationError) {
        return ResponseUtils.badRequest(res, validationError);
      }
      const book = await BookService.createSingleBook(req.body);
      ResponseUtils.success(res, book, 201);
    }
  } catch (error: any) {
    ResponseUtils.recordsError(res, error.code);
    console.error(error);
    next(error);
  }
});

/**
 * PUT edit book(s) for updating
 */
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Array.isArray(req.body)) {
      const { updateResults, errors } = await BookService.updateMultipleBooks(req.body);
      return ResponseUtils.bulkOperationResult(res, "books updated", updateResults, errors);
    }

    if (!req.body.bookId || !req.body.title) {
      return ResponseUtils.badRequest(res, "Some book info is missing");
    }
    const book = await BookService.updateBook(req.body.bookId, req.body);
    if (!book) {
      return ResponseUtils.notFound(res, "Book not found");
    }
    ResponseUtils.success(res, "Book updated successfully");
  } catch (error: any) {
    ResponseUtils.recordsError(res, error.code);
    console.error(error);
    next(error);
  }
});

router.delete("/:bookId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = parseInt(req.params.bookId);
    if (!ValidationUtils.isValidBookId(bookId)) {
      return ResponseUtils.badRequest(res, "Invalid book ID");
    }

    const result = await BookService.deleteBook(bookId);
    if (result.deletedCount === 0) {
      return ResponseUtils.notFound(res, "Book not found");
    }

    ResponseUtils.success(res, {
      message: "Book deleted successfully"
    });
  } catch (error) {
    console.error(error);
    ResponseUtils.error(res, "Server error");
    next(error);
  }
});

export default router;