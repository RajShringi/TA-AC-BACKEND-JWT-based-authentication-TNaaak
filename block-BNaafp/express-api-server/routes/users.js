var express = require("express");
const User = require("../models/User");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("email/password is required");
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json("user is not registerd");
    }
    const result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json("invalid password");
    }
    console.log(user, result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;