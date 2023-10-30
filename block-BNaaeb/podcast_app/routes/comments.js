var Article = require('../models/Article');
var Comment = require('../models/Comment');
const express = require('express');
const router = express.Router();

/* -----Edit (Update) comments----- */

/* -----1: GET an update form for a comment----- */
router.get('/:commentid/edit', async (req, res, next) => {
  var commentid = req.params.commentid;
  console.log(commentid);

  var oneCommentObj = await Comment.findById(commentid);
  console.log(oneCommentObj);
  res.render('updateCommentForm', { oneCommentObj });
});
/* -----2: Store the updated Comment in DB and display updated Comment in UI----- */
router.post('/:commentid', async (req, res, next) => {
  var commentid = req.params.commentid;
  console.log(commentid, req.body);
  let updatedComment = await Comment.findByIdAndUpdate(commentid, req.body, {
    new: true,
  });
  // console.log(
  //   'This is the UPDETED COmments article id---------' +
  //     updatedComment.articleId
  // );
  res.redirect('/articles/' + updatedComment.articleId);
});

/* -----Delete Comment----- */
router.get('/:commentid/delete', async (req, res, next) => {
  var commentid = req.params.commentid;
  var deletedComment = await Comment.findByIdAndRemove(commentid);
  var updateComment = await Article.findByIdAndUpdate(deletedComment.eventId, {
    $pull: { comments: deletedComment._id },
  });
  res.redirect('/articles/' + updateComment.eventId);
});

module.exports = router;
