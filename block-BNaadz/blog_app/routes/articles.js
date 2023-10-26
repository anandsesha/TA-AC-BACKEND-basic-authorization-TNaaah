var express = require('express');
var router = express.Router();
var Article = require('../models/Article');
var Comment = require('../models/Comment');
const auth = require('../middlewares/auth');

/* ------------- Display ALL Articles ------------- */
router.get('/', async (req, res, next) => {
  var allArticlesArray = await Article.find({});
  console.log(allArticlesArray);
  res.render('articles', { allArticlesArray });
});

/* ------------- Display single Article details ------------- */
router.get('/:slug', async (req, res, next) => {
  try {
    var slug = req.params.slug;
    console.log(slug);
    var singleArticleObj = await Article.findOne({ slug })
      .populate('comments')
      .exec();
    if (!singleArticleObj) {
      // Handle the case where the article is not found
      return res.status(404).send('Article not found');
    }
    // using the articleId you have found all the comments in that article as shown below
    var allComments = singleArticleObj.comments || [];
    console.log(req.session.userId);
    console.log(allComments);
    res.render('singleArticleDetails', { singleArticleObj });
  } catch (err) {
    next(err);
  }
});

router.use(auth.loggedInUser);

/* ------------- Add New Article ------------- */
/* Give the client a form to add an Article */
router.get('/new', function (req, res, next) {
  // var flashMsg = req.flash('error')[0];
  // console.log(flashMsg);
  res.render('createNewArticle');
});

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body.title);
    // if (req.body.title) {
    //   req.flash('error', 'This title is already taken!');
    //   res.redirect('/articles/new');
    // }
    var newArticle = await Article.create(req.body);
    res.redirect('/articles');
  } catch (err) {
    next(err);
  }
});

/* ------------- Handle Likes for single Article  ------------- */
router.get('/:articleid/articleLikes', async (req, res, next) => {
  var articleId = req.params.articleid;
  await Article.findByIdAndUpdate(articleId, { $inc: { likes: 1 } });
  res.redirect('/articles/' + articleId);
});

/* ------------- Edit(update) for single Article  ------------- */
router.get('/:articleid/edit', async (req, res, next) => {
  var articleId = req.params.articleid;
  var singleArticleObj = await Article.findById(articleId);
  res.render('articleUpdateform', { singleArticleObj });
});

router.post('/:articleid/update', async (req, res, next) => {
  var articleId = req.params.articleid;
  var updatedArticle = await Article.findByIdAndUpdate(articleId, req.body, {
    new: true,
  });
  res.redirect('/articles');
});

/* ------------- Delete for a single Article  ------------- */
router.get('/:articleid/delete', async (req, res, next) => {
  var articleId = req.params.articleid;
  var deletedArticle = await Article.findByIdAndRemove(articleId);
  await Comment.deleteMany({ articleId: deletedArticle.id });
  res.redirect('/articles');
});

/* -----Add (CREATE) comments for a single Event----- */
router.post('/:articleid/comments', async (req, res, next) => {
  var articleid = req.params.articleid;
  req.body.articleid = articleid;
  let oneComment = await Comment.create(req.body);
  // now cross-reference comment to Article table
  let updatedArticle = await Article.findByIdAndUpdate(articleid, {
    $push: { comments: oneComment._id },
  });
  res.redirect('/articles/' + articleid);
});

/* -----List all the comments for a single article----- */
router.get('/:articleid', async (req, res, next) => {
  var articleId = req.params.articleid;
  var singleArticleObj = await Article.findById(articleId)
    .populate('comments')
    .exec();
  var allComments = await Comment.find({ articleId: articleId });
  console.log(allComments);
  res.render('singleArticleDetails', { singleArticleObj });
});

/* -----Handle Likes for each comment ----- */
router.get('/:articleid/:commentid/commentLike', async (req, res, next) => {
  var articleId = req.params.articleid;
  var commentid = req.params.commentid;
  // console.log(`This is consoled...............` + articleId, commentid);

  var updatedComment = await Comment.findByIdAndUpdate(commentid, {
    $inc: { likes: 1 },
  });

  res.redirect('/articles/' + articleId);
});

// All Comment actions in comments.js route
module.exports = router;
