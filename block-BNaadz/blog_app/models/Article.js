const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const slugify = require('slugify');

var articleSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true, maxlength: 20 },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], //Multiple comments made on this article (use ONE-MANY association)
    author: String,
    slug: { type: String, require: true, unique: true },
  },
  { timestamps: true }
);

/*
---------SLUG pre-save hook--------
While inserting the article data into database:

1. define a pre save to generate slug from title and save it to database
2. ensure that each slug generated should be unique in entire articles collection.
3. optionally, you can use slug or slugger npm module to generate slug.

*/
// articleSchema.pre('save', function (next) {
//   if (!this.slug) {
//     return this.title.split(' ').join('-');
//   }
// });
//Instead of the above we have used the slugify() below:

articleSchema.pre('save', async function (next) {
  // Generate a slug from the title if a slug doesn't exist
  if (!this.slug) {
    const baseSlug = slugify(this.title, { lower: true });

    // Check if the generated slug already exists in the database
    let slug = baseSlug;
    let slugExists = true;
    let slugCount = 1;

    while (slugExists) {
      const existingArticle = await this.constructor.findOne({ slug });
      if (existingArticle) {
        slug = `${baseSlug}-${slugCount}`;
        slugCount++;
      } else {
        slugExists = false;
      }
    }

    this.slug = slug;
  }

  next();
});

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;
