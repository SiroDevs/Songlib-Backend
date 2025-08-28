import { Router, Request, Response, NextFunction } from "express";

import Acounter from "../models/acounter";
import Book from "../models/book";

const router = Router();

/**
 * GET book list.
 *
 * @return book list | empty.
 */
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Book.find({}).select("-_id").sort("bookNo");
    res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * GET single book.
 *
 * @return book details | empty.
 */
router.get("/:bookId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Book.findOne({ bookId: req.params.bookId });
    if (!data) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * POST new book.
 *
 * @return book details | empty.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Array.isArray(req.body)) {
      const promises = req.body.map(async (item: any) => {
        if (item.title) {
          const counter = await Acounter.findOne({ _id: "books" });
          if (!counter) throw new Error("Counter not found");

          item.bookid = counter.seq + 1;

          await Book.create(item);
          await Acounter.findOneAndUpdate(
            { _id: "books" },
            { $inc: { seq: 1 } },
            { new: true }
          );
        }
      });

      await Promise.all(promises);
      return res.json("items created successfully");
    } else {
      if (req.body.title) {
        const counter = await Acounter.findOne({ _id: "books" });
        if (!counter) throw new Error("Counter not found");

        req.body.bookid = counter.seq + 1;

        const data = await Book.create(req.body);

        await Acounter.findOneAndUpdate(
          { _id: "books" },
          { $inc: { seq: 1 } },
          { new: true }
        );

        return res.json(data);
      } else {
        return res.json({
          error: "An input field is either empty or invalid",
        });
      }
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
 * PUT edit book.
 *
 * @return book details | empty.
 */
router.put("/:bookid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "Invalid input field(s)" });
    }

    const book = await Book.findOneAndUpdate(
      { bookid: req.params.bookid },
      req.body,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    next(error);
  }
});

/**
 * DELETE a book.
 *
 * @return delete result | empty.
 */
router.delete("/:bookid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Book.deleteOne({ bookid: req.params.bookid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

export default router;
