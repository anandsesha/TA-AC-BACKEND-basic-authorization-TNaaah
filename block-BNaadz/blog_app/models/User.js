var mongoose = require('mongoose');
const { use } = require('../routes');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 5 },
    city: String,
  },
  { timestamps: true }
);

/*---------------Define a method on userSchema to generate fullName of the user using firstName and lastName------------*/
userSchema.methods.getFullName = function (next) {
  console.log('here');
  return this.fname + ' ' + this.lname;
  //   next();
};

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    console.log(this, `inside pre-save hook`);
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      console.log(hashed);
      this.password = hashed; // put the hashed passwd into existing string passwrod '123456'
      return next();
    });
  } else {
    next();
  }
});

/*
in line -> return next(); above,
Using next(); without return: 
If you use next(); without return, it will continue executing the code after 
the bcrypt.hash callback, even if there was an error during hashing. 
This means that the subsequent code could be executed even when there's an error,
potentially leading to unexpected behavior or bugs.
*/

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
