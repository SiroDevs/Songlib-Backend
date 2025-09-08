import { Router, Request, Response, NextFunction } from "express";
import { SongService } from "../services/songService";
import { ResponseUtils } from "../utils/responseUtils";
import { ValidationUtils } from "../utils/validationUtils";

const router = Router();

/**
 * GET single song by ID
 */
router.get("/:songId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const songId = parseInt(req.params.songId);
    const song = await SongService.getSongById(songId);
    if (!song) {
      return ResponseUtils.notFound(res, "Song not found");
    }
    ResponseUtils.success(res, song);
  } catch (error) {
    ResponseUtils.error(res, "Server error");
    console.error(error);
    next(error);
  }
});

/**
 * GET songs by book ID(s)
 */
router.get("/book/:bookIds", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookIds = ValidationUtils.parseBookIds(req.params.bookIds);
    if (bookIds.length === 0) {
      return ResponseUtils.badRequest(res, "Invalid book IDs");
    }

    const songs = await SongService.getSongsByBookIds(bookIds);
    if (songs.length === 0) {
      return ResponseUtils.notFound(res, "No songs found for the specified books");
    }
    ResponseUtils.success(res, songs);
  } catch (error) {
    ResponseUtils.error(res, "Server error");
    console.error(error);
    next(error);
  }
});

/**
 * POST new song(s)
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (ValidationUtils.isBulkOperation(req.body)) {
      const { createdSongs, errors } = await SongService.createMultipleSongs(req.body);

      return ResponseUtils.bulkOperationResult(
        res,
        "Creation",
        createdSongs,
        errors,
        201
      );
    } else {
      const validationError = ValidationUtils.validateSongData(req.body);
      if (validationError) {
        return ResponseUtils.badRequest(res, validationError);
      }
      const song = await SongService.createSingleSong(req.body);
      ResponseUtils.success(res, song, 201);
    }
  } catch (error: any) {
    ResponseUtils.recordsError(res, error.code);
    console.error(error);
    next(error);
  }
});

/**
 * PUT update single song
 */
router.put("/:songId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const songId = parseInt(req.params.songId);
    if (!req.body.title) {
      return ResponseUtils.badRequest(res, "Title is required");
    }
    const song = await SongService.updateSong(songId, req.body);
    if (!song) {
      return ResponseUtils.notFound(res, "Song not found");
    }
    ResponseUtils.success(res, song);
  } catch (error: any) {
    ResponseUtils.recordsError(res, error.code);
    console.error(error);
    next(error);
  }
});

/**
 * PUT bulk update song IDs
 */
router.put("/bulk/:value", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valueToAdd = parseInt(req.params.value);
    const { book } = req.body;
    if (!book) {
      return ResponseUtils.badRequest(res, "Book is required");
    }
    const result = await SongService.bulkUpdateSongIds(book, valueToAdd);

    if (result.updatedCount === 0) {
      return ResponseUtils.notFound(res, "No songs found for the specified book");
    }

    ResponseUtils.success(res, {
      message: `${result.updatedCount} songs updated successfully`,
    });
  } catch (error) {
    ResponseUtils.error(res, "Server error");
    console.error(error);
    next(error);
  }
});

/**
 * DELETE single song
 */
router.delete("/:songId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const songId = parseInt(req.params.songId);
    const result = await SongService.deleteSong(songId);
    if (result.deletedCount === 0) {
      return ResponseUtils.notFound(res, "Song not found");
    }
    ResponseUtils.success(res, {
      message: "Song deleted successfully",
    });
  } catch (error) {
    ResponseUtils.error(res, "Server error");
    console.error(error);
    next(error);
  }
});

/**
 * DELETE all songs from a book
 */
router.delete("/bulk/:book", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { book } = req.params;
    const deletedCount = await SongService.deleteSongsByBook(book);
    if (deletedCount === 0) {
      return ResponseUtils.notFound(res, "No songs found for the specified book");
    }
    ResponseUtils.success(res, {
      message: `${deletedCount} songs deleted successfully`,
    });
  } catch (error) {
    ResponseUtils.error(res, "Server error");
    console.error(error);
    next(error);
  }
});

export default router;