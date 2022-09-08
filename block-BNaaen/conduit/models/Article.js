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
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (this.title && this.isModified("title")) {
    this.slug = `${slugify(this.title.toLowerCase())}-${Date.now()}`;
  }
  next();
});

articleSchema.methods.articleJSON = function (user = null) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    tagList: this.tagList,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    favorited: user ? this.favoritedBy.includes(user.id) : false,
    favoritesCount: this.favoritedBy.length,
    author: this.author.profileJSON(user),
  };
};

module.exports = mongoose.model("Article", articleSchema);
