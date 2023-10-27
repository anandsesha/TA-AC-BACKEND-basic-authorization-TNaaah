var express = require('express');
const auth = require('../middlewares/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/users');
});

router.get('/protected', auth.loggedInUser, function (req, res, next) {
  console.log(req.session, req.session.userId);
  res.send('Protected Resource!!!');
});

module.exports = router;
