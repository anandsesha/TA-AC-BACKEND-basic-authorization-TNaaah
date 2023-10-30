var express = require('express');
var router = express.Router();
var Podcast = require('../models/Podcast');
var Comment = require('../models/Comment');
var auth = require('../middlewares/auth');

/* ------------- Display ALL Podcasts ------------- */
router.get('/', async (req, res, next) => {
  var allPodcastsArray = await Podcast.find({});
  console.log(allPodcastsArray);
  res.render('podcastsDashboard', { allPodcastsArray });
});

/* ------------- Display single Podcast details ------------- */
router.get('/:slug', async (req, res, next) => {
  try {
    var slug = req.params.slug;
    console.log(slug);
    var singlePodcastObj = await Podcast.findOne({ slug })
      .populate('comments')
      .exec();
    if (!singlePodcastObj) {
      // Handle the case where the Podcast is not found
      return res.status(404).send('Podcast not found');
    }
    // using the PodcastId you have found all the comments in that Podcast as shown below
    var allComments = singlePodcastObj.comments || [];
    console.log(req.session.userId);
    console.log(allComments);
    res.render('singlePodcastDetails', { singlePodcastObj });
  } catch (err) {
    next(err);
  }
});

router.use(auth.loggedInUser);

/* ------------- Add New Podcast ------------- */
/* Give the client a form to add an Podcast */
router.get('/new', function (req, res, next) {
  var flashMsg = req.flash('error')[0];
  console.log(`Hereeeeeeeeeeee` + flashMsg);
  res.render('createNewPodcast');
});

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body.title);
    console.log(req.body.membershipType);
    console.log(req.body.isAdmin);

    // if (req.body.title) {
    //   req.flash('error', 'This title is already taken!');
    //   res.redirect('/Podcasts/new');
    // }
    var newPodcast = await Podcast.create(req.body);
    res.redirect('/Podcasts');
  } catch (err) {
    next(err);
  }
});

/* ------------- Handle Likes for single Podcast  ------------- */
router.get('/:Podcastid/PodcastLikes', async (req, res, next) => {
  var PodcastId = req.params.Podcastid;
  await Podcast.findByIdAndUpdate(PodcastId, { $inc: { likes: 1 } });
  res.redirect('/Podcasts/' + PodcastId);
});

/* ------------- Edit(update) for single Podcast  ------------- */
router.get('/:Podcastid/edit', async (req, res, next) => {
  var PodcastId = req.params.Podcastid;
  var singlePodcastObj = await Podcast.findById(PodcastId);
  res.render('PodcastUpdateform', { singlePodcastObj });
});

router.post('/:Podcastid/update', async (req, res, next) => {
  var PodcastId = req.params.Podcastid;
  var updatedPodcast = await Podcast.findByIdAndUpdate(PodcastId, req.body, {
    new: true,
  });
  res.redirect('/Podcasts');
});

/* ------------- Delete for a single Podcast  ------------- */
router.get('/:Podcastid/delete', async (req, res, next) => {
  var PodcastId = req.params.Podcastid;
  var deletedPodcast = await Podcast.findByIdAndRemove(PodcastId);
  await Comment.deleteMany({ PodcastId: deletedPodcast.id });
  res.redirect('/Podcasts');
});

/* -----Add (CREATE) comments for a single Event----- */
router.post('/:Podcastid/comments', async (req, res, next) => {
  var Podcastid = req.params.Podcastid;
  req.body.Podcastid = Podcastid;
  let oneComment = await Comment.create(req.body);
  // now cross-reference comment to Podcast table
  let updatedPodcast = await Podcast.findByIdAndUpdate(Podcastid, {
    $push: { comments: oneComment._id },
  });
  res.redirect('/Podcasts/' + Podcastid);
});

/* -----List all the comments for a single Podcast----- */
router.get('/:Podcastid', async (req, res, next) => {
  var PodcastId = req.params.Podcastid;
  var singlePodcastObj = await Podcast.findById(PodcastId)
    .populate('comments')
    .exec();
  var allComments = await Comment.find({ PodcastId: PodcastId });
  console.log(allComments);
  res.render('singlePodcastDetails', { singlePodcastObj });
});

/* -----Handle Likes for each comment ----- */
router.get('/:Podcastid/:commentid/commentLike', async (req, res, next) => {
  var PodcastId = req.params.Podcastid;
  var commentid = req.params.commentid;
  // console.log(`This is consoled...............` + PodcastId, commentid);

  var updatedComment = await Comment.findByIdAndUpdate(commentid, {
    $inc: { likes: 1 },
  });

  res.redirect('/Podcasts/' + PodcastId);
});

// All Comment actions in comments.js route
module.exports = router;
