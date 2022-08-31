const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

router.put("/:id", auth.verifyToken, async (req, res, next) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id);
    if (String(req.user.userId) === String(comment.author)) {
      const updatedComment = await Comment.findByIdAndUpdate(id, req.body);
      res.status(200).json(updatedComment);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
