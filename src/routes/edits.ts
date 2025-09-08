import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { Acounter, Edit } from "../models";

const router = express.Router();
const { ObjectId } = mongoose.Types;

/**
 * GET edit list.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const edits = await Edit.find({});
    res.json(edits);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * GET single edit.
 */
router.get("/:editid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const edit = await Edit.findOne({ editid: req.params.editid });
    if (!edit) return res.status(404).json({ message: "Edit not found" });
    res.json(edit);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * POST new edit.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res
        .status(400)
        .json({ error: "An input field is either empty or invalid" });
    }

    const counter = await Acounter.findOne({ _id: "edits" });
    if (!counter) return res.status(500).json({ error: "Counter not found" });

    req.body.editid = counter.seq + 1;
    const newEdit = await Edit.create(req.body);

    await Acounter.findOneAndUpdate(
      { _id: "edits" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    res.json(newEdit);
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
 * UPDATE edit.
 */
router.post("/:editid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res
        .status(400)
        .json({ error: "An input field is either empty or invalid" });
    }

    const myquery = { _id: new ObjectId(req.params.editid) };

    const updated = await Edit.updateOne(myquery, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE edit.
 */
router.delete("/:editid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Edit.deleteOne({ editid: req.params.editid });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Edit not found" });
    }
    res.json({ message: "Edit deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
