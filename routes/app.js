const express = require("express");
const router = express.Router();

/**
 * GET home.
 *
 * @return home page | empty.
 */
router.get("/", async (req, res) => {
  try {
    res.json({
      status: 200,
      message: "Songlib api is live!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
