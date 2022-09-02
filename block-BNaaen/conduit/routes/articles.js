const express = require("express");
const auth = require("../middleware/auth");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const User = require("../models/User");
const router = express.Router();

router.post("/", auth.verifyToken, async (req, res, next) => {
  req.body.article.author = req.user.userId;
  try {
    const article = await Article.create(req.body.article);
    res.json({ article: article });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:slug", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOne({ slug });
    const { title, description, body, tags } = req.body.article;
    article.title = title ? title : article.title;
    article.description = description ? description : article.description;
    article.body = body ? body : article.body;
    article.tags = tags ? tags : article.tags;
    const updatedArticle = await article.save();
    res.json({ article: updatedArticle });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:slug", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOneAndDelete({ slug });
    res.json({ article });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:slug/comments", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    req.body.comment.author = req.user.userId;
    const comment = await Comment.create(req.body.comment);
    const article = await Article.findOneAndUpdate(
      { slug },
      { $push: { comments: comment.id } }
    );
    res.json({ comment });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:slug/comments", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOne({ slug });
    const articleWithComments = await article.populate("comments");
    res.json({ comments: articleWithComments.comments });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete(
  "/:slug/comments/:id",
  auth.verifyToken,
  async (req, res, next) => {
    const slug = req.params.slug;
    const id = req.params.id;

    try {
      const comment = await Comment.findByIdAndDelete(id);
      const article = await Article.findOneAndUpdate(
        { slug },
        { $pull: { comments: comment.id } }
      );
      res.json({ article });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

router.post("/:slug/favorite", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOneAndUpdate(
      { slug },
      {
        $addToSet: { favoritedBy: req.user.userId },
        $inc: { favoritesCount: 1 },
      }
    );
    res.json({ article: article });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:slug/favorite", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOneAndUpdate(
      { slug },
      { $pull: { favoritedBy: req.user.userId }, $inc: { favoritesCount: -1 } }
    );
    res.json({ article: article });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/", async (req, res, next) => {
  let { tag, author, favorited, limit, offset } = req.query;
  limit = limit ? limit : 20;
  offset = offset ? offset : 0;
  try {
    let filter;
    if (tag) {
      filter = { tagList: tag };
    }
    if (author) {
      const user = await User.findOne({ username: author });
      filter = { author: user.id };
    }
    if (favorited) {
      const user = await User.findOne({ username: favorited });
      filter = { favoritedBy: user.id };
    }
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    res.json({ articles });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.get("/feed", auth.verifyToken, async (req, res, next) => {
  let { limit, offset } = req.query;
  limit = limit ? limit : 20;
  offset = offset ? offset : 0;
  try {
    const user = await User.findById(req.user.userId);
    const articles = await Article.find({ author: { $in: user.followings } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    res.json({ articles });
  } catch (err) {
    res.status(400).json(err);
  }
});
module.exports = router;
