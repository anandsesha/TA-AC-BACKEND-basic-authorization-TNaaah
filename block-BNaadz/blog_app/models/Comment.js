const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    likes: { type: Number, default: 0 },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' }, //will be associated to one of the Article(use ONE-MANY association)
    slug: String,
  },
  { timestamps: true }
);

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
