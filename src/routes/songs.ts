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
router.get("/books/:bookIds", async (req: Request, res: Response, next: NextFunction) => {
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
        "songs saved",
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
 * PUT edit song(s) for updating
 */
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Array.isArray(req.body)) {
      const { updateResults, errors } = await SongService.updateMultipleSongs(req.body);
      return ResponseUtils.bulkOperationResult(res, "song updated", updateResults, errors);
    }

    if (!req.body.songId || !req.body.songNo || !req.body.title) {
      return ResponseUtils.badRequest(res, "Some song info is missing");
    }
    const song = await SongService.updateSong(req.body.songId, req.body);
    if (!song) {
      return ResponseUtils.notFound(res, "Song not found");
    }
    ResponseUtils.success(res, "Song updated successfully");
  } catch (error: any) {
    ResponseUtils.recordsError(res, error.code);
    console.error(error);
    next(error);
  }
});

/**
 * PUT update single song
 */
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
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

export default router;