const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const articleSchema = new Schema(
  {
    slug: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    tagList: [{ type: String }],
    favoritesCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (this.title && this.isModified("title")) {
    this.slug = `${slugify(this.title)}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
