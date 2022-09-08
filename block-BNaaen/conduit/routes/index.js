var express = require("express");
var router = express.Router();
var Article = require("../models/Article");
var User = require("../models/User");
var auth = require("../middleware/auth");

/* GET home page. */
router.get("/tags", async (req, res, next) => {
  try {
    const tags = await Article.distinct("tagList");
    res.json({ tags });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.get("/user", auth.verifyToken, async (req, res, next) => {
  const id = req.user.userId;
  try {
    const user = await User.findById(id);
    res.status(200).json({ user: user.userJSON(req.headers.authorization) });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/user", auth.verifyToken, async (req, res, next) => {
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
    res.status(200).json({ user: user.userJSON(req.headers.authorization) });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;
