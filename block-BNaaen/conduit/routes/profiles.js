const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/:username", async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    res.json({ profile: user.profileJSON() });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:username/follow", auth.verifyToken, async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    const currentUserUpdated = await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { followings: user.id },
    });
    const currentUser = await User.findById(req.user.userId);
    res.json({ profile: user.profileJSON(currentUser) });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete(
  "/:username/unfollow",
  auth.verifyToken,
  async (req, res, next) => {
    const username = req.params.username;
    try {
      const user = await User.findOne({ username });
      const currentUserUpdated = await User.findByIdAndUpdate(req.user.userId, {
        $pull: { followings: user.id },
      });
      const currentUser = await User.findById(req.user.userId);
      res.json({ profile: user.profileJSON(currentUser) });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

module.exports = router;
