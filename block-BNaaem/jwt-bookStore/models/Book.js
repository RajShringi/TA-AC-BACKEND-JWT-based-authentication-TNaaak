const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  price: { type: Number },
  quantity: { type: Number },
});

module.exports = mongoose.model("Book", bookSchema);
