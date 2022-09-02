var express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
var router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const user = await User.create(req.body.user);
    res.json({ user: user });
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

router.get("/", auth.verifyToken, async (req, res, next) => {
  const id = req.user.userId;
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/", auth.verifyToken, async (req, res, next) => {
  const id = req.user.userId;
  try {
    let user = await User.findById(id);
    const { email, password, username, image, bio } = req.body.user;
    user.email = email ? email : user.email;
    user.password = password ? password : user.password;
    user.username = username ? username : user.username;
    user.image = image ? image : user.image;
    user.bio = bio ? bio : user.bio;
    user = await user.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;
