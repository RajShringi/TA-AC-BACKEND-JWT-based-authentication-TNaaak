const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const auth = require("../middleware/auth");
const Category = require("../models/Category");
const Comment = require("../models/Comment");
const Cart = require("../models/Cart");

router.use(auth.verifyToken);

router.post("/", async (req, res, next) => {
  try {
    console.log(req.user);
    categoriesArr = req.body.categories.split(",");
    req.body.author = req.user.userId;
    req.body.categories = [];
    let categories = await createCategory(categoriesArr);
    const book = await Book.create(req.body);
    await addCategoriesToBook(categories, book);
    await addBooksToCategory(categories, book);
    res.status(200).json(book);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const books = await Book.find({});
    res.json({ books });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    categoriesArr = req.body.categories.split(",");
    req.body.categories = [];
    const book = await Book.findById(id);
    console.log(String(req.user.userId), String(book.author));
    if (String(req.user.userId) === String(book.author)) {
      let categories = await createCategory(categoriesArr);
      const updatedBook = await Book.findByIdAndUpdate(id, req.body);
      await addCategoriesToBook(categories, updatedBook);
      await addBooksToCategory(categories, updatedBook);
      res.json(updatedBook);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const book = await Book.findByIdAndDelete(id);
    console.log(book);
    const comments = await Comment.deleteMany({ bookId: book._id });
    console.log(comments);
    const category = await Category.updateMany(
      { books: book._id },
      { $pull: { books: book._id } }
    );
    console.log(category);
    res.json({ book });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const id = req.params.id;
    req.body.author = req.user.userId;
    req.body.bookId = id;
    const comment = await Comment.create(req.body);
    const book = await Book.findByIdAndUpdate(id, {
      $push: { comments: comment.id },
    });
    res.status(200).json(comment);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:id/cart", async (req, res, next) => {
  try {
    const id = req.params.id;
    const { add, remove } = req.query;
    const book = await Book.findById(id);
    let updateCart;
    if (add) {
      const doesUserHaveCart = await Cart.findOne({ user: req.user.userId });
      console.log(doesUserHaveCart);
      if (!doesUserHaveCart) {
        let cart = await Cart.create({ user: req.user.userId });
        updateCart = await Cart.findByIdAndUpdate(cart.id, {
          $push: { books: book.id },
        });
      } else {
        updateCart = await Cart.findByIdAndUpdate(doesUserHaveCart.id, {
          $push: { books: book.id },
        });
      }
      res.json({ updateCart });
    }
    if (remove) {
      let cart = await Cart.findOneAndUpdate(
        { user: req.user.userId },
        { $pull: { books: book.id } }
      );
      res.json({ cart });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

const createCategory = async (categories) => {
  const allCategories = [];
  for (let category of categories) {
    let findCategory = await Category.findOne({ name: category });
    if (!findCategory) {
      let newCategory = await Category.create({ name: category });
      allCategories.push(newCategory);
    } else {
      allCategories.push(findCategory);
    }
  }
  console.log(allCategories);
  return allCategories;
};

const addCategoriesToBook = async (categories, book) => {
  for (let category of categories) {
    console.log(category.name);
    const updatedBook = await Book.findOneAndUpdate(
      { _id: book.id },
      {
        $addToSet: { categories: category.id },
      }
    );
    console.log(updatedBook);
  }
};

const addBooksToCategory = async (categories, book) => {
  for (let category of categories) {
    await Category.findOneAndUpdate(
      { _id: category.id },
      {
        $addToSet: { books: book.id },
      }
    );
  }
};

module.exports = router;
