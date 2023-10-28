var User = require('../models/User');

module.exports = {
  loggedInUser: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.redirect('/users/login');
    }
  },
  userInfo: async (req, res, next) => {
    var userId = req.session && req.session.userId;
    // console.log('User id over here' + userId);
    try {
      if (userId) {
        var user = await User.findById(userId, 'fname lname email');
        req.user = user;
        res.locals.user = user;
        next();
      } else {
        req.user = null;
        res.locals.user = null;
        next();
      }
    } catch (err) {
      next('User not found in userInfo');
    }
  },
};
