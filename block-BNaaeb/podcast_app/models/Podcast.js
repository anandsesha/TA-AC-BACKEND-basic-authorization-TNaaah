var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var podcastSchema = new Schema({
  podTitle: { type: String, required: true },
  podDescription: { type: String, required: true },
  potCategory: {
    type: String,
    enum: ['Free', 'VIP', 'PREMIUM'], //The enum constraint on the category field ensures that it can only have one of the specified values: "Free," "VIP," or "PREMIUM."
    required: true,
  },
  isVerified: { type: Boolean }, // Set to false initially, and the admin can verify it later.
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  likes: { type: Number, default: 0 },
});

podcastSchema.pre('save', async function (next) {
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

var Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;
