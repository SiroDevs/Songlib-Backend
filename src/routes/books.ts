import { Router, Request, Response, NextFunction } from "express";
import { Acounter, Book } from "../models";

const router = Router();

/**
 * GET book list
 * @return book list with count or just list
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await Book.find({}).select("-_id").sort("bookNo");
    
    // Return consistent format - always include count for consistency
    res.json({ 
      count: books.length, 
      data: books 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
    next(error);
  }
});

/**
 * GET single book or multiple books by IDs
 */
router.get("/:ids", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.params;
    
    // Handle multiple IDs separated by commas
    if (ids.includes(',')) {
      const bookIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (bookIds.length === 0) {
        return res.status(400).json({ error: "Invalid book IDs" });
      }
      
      const books = await Book.find({ bookId: { $in: bookIds } });
      return res.json({
        count: books.length,
        data: books
      });
    }
    
    // Handle single ID
    const bookId = parseInt(ids);
    if (isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }
    
    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
    next(error);
  }
});

/**
 * POST new book(s) - handles both single and bulk creation
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk creation
      const createdBooks = [];
      const errors = [];
      
      for (const [index, item] of req.body.entries()) {
        try {
          if (!item.title) {
            errors.push({ index, error: "Title is required" });
            continue;
          }

          const counter = await Acounter.findOne({ _id: "books" });
          if (!counter) throw new Error("Counter not found");

          item.bookId = counter.seq + 1;
          
          const newBook = await Book.create(item);
          createdBooks.push(newBook);
          
          await Acounter.findOneAndUpdate(
            { _id: "books" },
            { $inc: { seq: 1 } },
            { new: true }
          );
        } catch (error: any) {
          errors.push({ 
            index, 
            error: error.code === 11000 ? "Duplicate record" : "Creation failed",
            details: error.message
          });
        }
      }

      return res.status(201).json({
        message: "Bulk creation completed",
        created: createdBooks.length,
        failed: errors.length,
        data: createdBooks,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      // Single creation
      if (!req.body.title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const counter = await Acounter.findOne({ _id: "books" });
      if (!counter) throw new Error("Counter not found");

      req.body.bookId = counter.seq + 1;
      const book = await Book.create(req.body);

      await Acounter.findOneAndUpdate(
        { _id: "books" },
        { $inc: { seq: 1 } },
        { new: true }
      );

      return res.status(201).json(book);
    }
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate record found" });
    }
    res.status(500).json({ error: "Internal server error" });
    next(error);
  }
});

/**
 * PUT edit book(s) - handles both single and bulk updates
 */
router.put("/:ids?", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle bulk update from body array
    if (Array.isArray(req.body)) {
      const updateResults = [];
      const errors = [];
      
      for (const [index, item] of req.body.entries()) {
        try {
          if (!item.bookId) {
            errors.push({ index, error: "bookId is required for update" });
            continue;
          }

          if (!item.title) {
            errors.push({ index, error: "Title is required" });
            continue;
          }

          const { bookId, ...updateData } = item;
          const book = await Book.findOneAndUpdate(
            { bookId },
            updateData,
            { new: true, runValidators: true }
          );

          if (!book) {
            errors.push({ index, bookId, error: "Book not found" });
            continue;
          }

          updateResults.push(book);
        } catch (error: any) {
          errors.push({ 
            index, 
            bookId: item.bookId,
            error: error.code === 11000 ? "Duplicate record" : "Update failed",
            details: error.message
          });
        }
      }

      return res.json({
        message: "Bulk update completed",
        updated: updateResults.length,
        failed: errors.length,
        data: updateResults,
        errors: errors.length > 0 ? errors : undefined
      });
    }
    
    // Handle single update from URL parameter
    const bookId = req.params.ids ? parseInt(req.params.ids) : req.body.bookId;
    
    if (!bookId || isNaN(bookId)) {
      return res.status(400).json({ error: "Valid bookId is required" });
    }

    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const book = await Book.findOneAndUpdate(
      { bookId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate record found" });
    }
    res.status(500).json({ error: "Internal server error" });
    next(error);
  }
});

/**
 * DELETE book(s) - handles both single and bulk deletion
 */
router.delete("/:ids?", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle bulk deletion from body array
    if (Array.isArray(req.body)) {
      const deleteResults = [];
      const errors = [];
      
      for (const [index, item] of req.body.entries()) {
        try {
          if (!item.bookId) {
            errors.push({ index, error: "bookId is required for deletion" });
            continue;
          }

          const result = await Book.deleteOne({ bookId: item.bookId });
          
          if (result.deletedCount === 0) {
            errors.push({ index, bookId: item.bookId, error: "Book not found" });
            continue;
          }

          deleteResults.push({ bookId: item.bookId, deleted: true });
        } catch (error: any) {
          errors.push({ 
            index, 
            bookId: item.bookId,
            error: "Deletion failed",
            details: error.message
          });
        }
      }

      return res.json({
        message: "Bulk deletion completed",
        deleted: deleteResults.length,
        failed: errors.length,
        data: deleteResults,
        errors: errors.length > 0 ? errors : undefined
      });
    }
    
    // Handle single deletion from URL parameter or query string
    let bookId: number;
    
    if (req.params.ids) {
      bookId = parseInt(req.params.ids);
    } else if (req.query.bookId) {
      bookId = parseInt(req.query.bookId as string);
    } else {
      return res.status(400).json({ error: "bookId is required" });
    }

    if (isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const result = await Book.deleteOne({ bookId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ 
      message: "Book deleted successfully",
      bookId 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;