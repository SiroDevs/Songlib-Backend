import { Router, Request, Response, NextFunction } from "express";

import Acounter from "./models/acounter";
import User from "./models/user";

const router = Router();

/**
 * GET user list.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * GET single user.
 */
router.get("/:userid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ userid: req.params.userid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * POST new user.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ error: "username is required" });
    }

    const counter = await Acounter.findOne({ _id: "users" });
    if (!counter) {
      return res.status(500).json({ error: "Counter not initialized" });
    }

    req.body.userid = counter.seq + 1;

    const newUser = await User.create(req.body);

    // increment counter
    await Acounter.findOneAndUpdate({ _id: "users" }, { $inc: { seq: 1 } });

    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate record found" });
    }
    console.error(error);
    next(error);
  }
});

/**
 * PUT edit user.
 */
router.put("/:userid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ error: "username is required" });
    }

    // Update by userid (keeps consistency with other routes that use userid as business id)
    const updated = await User.findOneAndUpdate(
      { userid: req.params.userid },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * DELETE a user.
 */
router.delete("/:userid", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await User.findOneAndDelete({ userid: req.params.userid });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ status: 200, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
