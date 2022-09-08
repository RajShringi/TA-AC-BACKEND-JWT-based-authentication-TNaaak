const express = require("express");
const auth = require("../middleware/auth");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const User = require("../models/User");
const router = express.Router();

router.get("/feed", auth.verifyToken, async (req, res, next) => {
  let { limit, offset } = req.query;
  limit = limit ? limit : 20;
  offset = offset ? offset : 0;
  try {
    const user = await User.findById(req.user.userId);
    const articles = await Article.find({ author: { $in: user.followings } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    const newArticles = await getArticles(articles, user);
    res.json({ articles: newArticles });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:slug", auth.optionalAuth, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    article = await article.populate("author");
    if (req.user) {
      const user = await User.findById(req.user.userId);
      res.json({
        article: article.articleJSON(user),
      });
    } else {
      res.json({
        article: article.articleJSON(),
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.post("/", auth.verifyToken, async (req, res, next) => {
  req.body.article.author = req.user.userId;
  try {
    let article = await Article.create(req.body.article);
    article = await article.populate("author");
    const user = await User.findById(req.user.userId);
    res.json({
      article: article.articleJSON(user),
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:slug", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOne({ slug });
    const user = await User.findById(req.user.userId);
    const { title, description, body, tags } = req.body.article;
    article.title = title ? title : article.title;
    article.description = description ? description : article.description;
    article.body = body ? body : article.body;
    article.tags = tags ? tags : article.tags;
    let updatedArticle = await article.save();
    updatedArticle = await updatedArticle.populate("author");
    res.json({ article: updatedArticle.articleJSON(user) });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:slug", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    let article = await Article.findOneAndDelete({ slug });
    article = await article.populate("author");
    const user = await User.findById(req.user.userId);
    res.json({
      article: article.articleJSON(user),
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:slug/comments", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    req.body.comment.author = req.user.userId;
    const user = await User.findById(req.user.userId);
    const comment = await Comment.create(req.body.comment);
    const article = await Article.findOneAndUpdate(
      { slug },
      { $push: { comments: comment.id } }
    );
    res.json({ comment: comment.commentJSON(user) });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:slug/comments", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    article = await article.populate("comments");
    const user = await User.findById(req.user.userId);
    const newComments = await getComments(article.comments, user);
    res.json({ comments: newComments });
  } catch (err) {
    console.log(err);
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
      const user = await User.findById(req.user.userId);
      const article = await Article.findOneAndUpdate(
        { slug },
        { $pull: { comments: comment.id } }
      );
      res.json({ comment: comment.commentJSON(user) });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

router.post("/:slug/favorite", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const user = await User.findById(req.user.userId);
    let article = await Article.findOneAndUpdate(
      { slug },
      {
        $addToSet: { favoritedBy: req.user.userId },
      },
      { returnDocument: "after" }
    );
    article = await article.populate("author");
    res.json({
      article: article.articleJSON(user),
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:slug/favorite", auth.verifyToken, async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const user = await User.findById(req.user.userId);
    let article = await Article.findOneAndUpdate(
      { slug },
      { $pull: { favoritedBy: req.user.userId } },
      { returnDocument: "before" }
    );
    article = await article.populate("author");
    res.json({
      article: article.articleJSON(user),
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.get("/", auth.optionalAuth, async (req, res, next) => {
  let { tag, author, favorited, limit, offset } = req.query;
  let newArticles;
  limit = limit ? limit : 20;
  offset = offset ? offset : 0;
  try {
    let filter = {};
    if (tag) {
      filter.tagList = tag;
    }
    if (author) {
      const user = await User.findOne({ username: author });
      filter.author = user.id;
    }
    if (favorited) {
      const user = await User.findOne({ username: favorited });
      filter.favoritedBy = user.id;
    }
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    if (req.user) {
      const user = await User.findById(req.user.userId);
      newArticles = await getArticles(articles, user);
    } else {
      newArticles = await getArticles(articles);
    }
    res.json({ articles: newArticles });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;

async function getArticles(articles, user = null) {
  const articlesPromises = [];
  let responseFormatArticles = [];
  articles.forEach((article) => {
    articlesPromises.push(article.populate("author"));
  });
  const newArticles = await Promise.all(articlesPromises);
  newArticles.forEach((article) => {
    responseFormatArticles.push(article.articleJSON(user));
  });
  return responseFormatArticles;
}

async function getComments(comments, user = null) {
  const commentsPromises = [];
  let responseFormatComments = [];
  comments.forEach((comment) => {
    commentsPromises.push(comment.populate("author"));
  });
  const newComments = await Promise.all(commentsPromises);
  newComments.forEach((comment) =>
    responseFormatComments.push(comment.commentJSON(user))
  );
  return responseFormatComments;
}
