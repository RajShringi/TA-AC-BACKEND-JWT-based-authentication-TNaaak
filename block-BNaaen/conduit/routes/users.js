var express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
var router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const user = await User.create(req.body.user);
    const token = await user.signToken();
    res.status(200).json({ user: user.userJSON(token) });
  } catch (err) {
    res.status(400).json({ err });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body.user;
  if (!email || !password) {
    return res.status(400).json({ err: "email/password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ err: "email is not register" });
    }
    const result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ err: "Invalid password" });
    }
    const token = await user.signToken();
    res.status(200).json({ user: user.userJSON(token) });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;
