var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* Users Home Page */
router.get('/', function (req, res, next) {
  console.log(req.session);
  res.render('userHomePage');
});

/* ------- Handle a GET request on `/users/register` where render the registration form ------*/
router.get('/register', async (req, res, next) => {
  res.render('registerForm');
});

/* ------- Handle a POST request on `/users/register` where we will capture the data & save it into mongoDB database ------*/
router.post('/register', async (req, res, next) => {
  var newUser = await User.create(req.body);
  console.log(`inside user.create() router`);
  res.redirect('/users/login');
});
/*-----------------handle a GET request on `/users/login` to render the login form which should accept ----------------*/
router.get('/login', async (req, res, next) => {
  var flashErrMsg = req.flash('error')[0];
  res.render('loginForm', { flashErrMsg });
});

/* ------- Handle a POST request on `/users/login` where we will 
1. handle a POST request on `users/login` where we verify the login credentials passed by the user
2. after a successful login attempt, create a session for each logged in user & redirect to /dashboard page (or any page) by creating one
3. persist logged in session information on server side using connect-mongo
 ------*/
router.post('/login', async (req, res, next) => {
  //1
  var { email, password } = req.body;
  if (!email || !password) {
    // if email or password is not entered go back to login page again
    return res.redirect('/users/login');
  }

  try {
    var user = await User.findOne({ email });
  } catch (err) {
    res.send(`User not found in DB`);
  }

  if (!user) {
    // on login, if the entered user does not exist in db send back to login page
    res.redirect('/users/login');
  }

  if (password.length < 4) {
    req.flash(
      'error',
      'Email is not unique OR Password is less than 4 charaters!'
    );
    res.redirect('/users/login');
  }

  //after these 2 checks, we now have a legit (registered) user. Therefore, verify his password.
  //for that first add the verifyPassword method inside schema and do bycrypt in there. Refer models/User.js

  var verifiedUser = user.verifyPassword(password, (err, result) => {
    if (err) return next(err);
    if (!result) {
      // if hash dosent match the entered string passwd go back to login
      return res.redirect('/users/login');
    }
    //But if hash matches the passwd entered, then persist data in DB.
    //Create session in app.js
    //after session is created we put the hashed userID from DB inside the session in a key called sessionId
    req.session.userId = user.id;
    // req.body.author = req.user._id;
    res.redirect('/podcasts');
  });
});

router.get('/logout', async (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
