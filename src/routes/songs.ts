import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import Acounter from "./models/acounter";
import Org from "./models/org";

const router = Router();
const { ObjectId } = mongoose.Types;

/**
 * GET org list.
 *
 * @return org list | empty.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Org.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

/**
 * GET single org.
 *
 * @return org details | empty.
 */
router.get("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await Org.findOne({ orgid: req.params.orgid });
    if (!org) {
      return res.status(404).json({ message: "Org not found" });
    }
    res.status(200).json(org);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

/**
 * POST new org.
 *
 * @return org details | error.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        error: "An input field is either empty or invalid",
      });
    }

    const counter = await Acounter.findOne({ _id: "orgs" });
    if (!counter) {
      return res.status(500).json({ error: "Counter not found" });
    }

    req.body.orgid = counter.seq + 1;

    const newOrg = await Org.create(req.body);

    await Acounter.findOneAndUpdate(
      { _id: "orgs" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    res.json(newOrg);
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
 * UPDATE org.
 *
 * @return updated org | error.
 */
router.put("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        error: "An input field is either empty or invalid",
      });
    }

    const updated = await Org.updateOne(
      { _id: new ObjectId(req.params.orgid) },
      req.body
    );

    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: "Org not found" });
    }

    res.json({ message: "Org updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

/**
 * DELETE a org.
 *
 * @return delete result | error.
 */
router.delete("/:orgid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Org.deleteOne({ orgid: req.params.orgid });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Org not found" });
    }
    res.status(200).json({ message: "Org deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
    next(error);
  }
});

export default router;
