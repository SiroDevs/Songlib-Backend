import { Router, Request, Response, NextFunction } from "express";
import { BookService } from "../services/bookService";
import { ResponseUtils } from "../utils/responseUtils";
import { ValidationUtils } from "../utils/validationUtils";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await BookService.getAllBooks();
    ResponseUtils.success(res, { data: books });
  } catch (error) {
    ResponseUtils.error(res, "Server error");
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
    return ResponseUtils.success(res, { data: books });
  } catch (error) {
    console.error(error);
    const books = await BookService.getAllBooks();
    ResponseUtils.success(res, { data: books });
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
        "Creation",
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
router.put("/:ids?", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (ValidationUtils.isBulkOperation(req.body)) {
      const { updateResults, errors } = await BookService.updateMultipleBooks(req.body);

      return ResponseUtils.bulkOperationResult(
        res,
        "Update",
        updateResults,
        errors
      );
    }

    const bookId = req.params.ids ? parseInt(req.params.ids) : req.body.bookId;
    if (!ValidationUtils.isValidBookId(bookId)) {
      return ResponseUtils.badRequest(res, "Valid bookId is required");
    }

    if (!req.body.title) {
      return ResponseUtils.badRequest(res, "Title is required");
    }

    const book = await BookService.updateBook(bookId, req.body);
    if (!book) {
      return ResponseUtils.notFound(res, "Book not found");
    }
    ResponseUtils.success(res, book);
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