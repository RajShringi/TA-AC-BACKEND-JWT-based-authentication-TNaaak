var express = require("express");
var router = express.Router();
var Article = require("../models/Article");

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

module.exports = router;
