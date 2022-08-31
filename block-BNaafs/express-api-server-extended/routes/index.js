var express = require("express");
var router = express.Router();
var auth = require("../middleware/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/dashboard", auth.verifyToken, async (req, res, next) => {
  console.log(req.user);
  res.json({ msg: "dashboard" });
});

module.exports = router;
