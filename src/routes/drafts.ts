import { Router, Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

import { Acounter, Draft } from "../models";

const router = Router();

/**
 * GET draft list.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Draft.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * GET single draft.
 */
router.get("/:draftid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const draft = await Draft.findOne({ draftid: req.params.draftid });
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }
    res.status(200).json(draft);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * POST new draft.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "An input field is either empty or invalid" });
    }

    const counter = await Acounter.findOne({ _id: "drafts" });
    if (!counter) {
      return res.status(500).json({ error: "Counter not initialized" });
    }

    req.body.draftid = counter.seq + 1;

    const draft = await Draft.create(req.body);
    await Acounter.findOneAndUpdate(
      { _id: "drafts" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    res.json(draft);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: "Duplicate record found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
    next(error);
  }
});

/**
 * POST edit draft.
 */
router.post("/:draftid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "An input field is either empty or invalid" });
    }

    const myquery = { _id: new ObjectId(req.params.draftid) };
    const result = await Draft.updateOne(myquery, req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * DELETE a draft.
 */
router.delete("/:draftid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Draft.deleteOne({ draftid: req.params.draftid });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Draft not found" });
    }
    res.status(200).json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
