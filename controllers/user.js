const { User, Token } = require("../models");
const { randomBytes } = require("crypto");
const bcrypt = require("bcrypt");

const createToken = (user) => {
  return new Token({
    user: user._id,
    token: randomBytes(40).toString("hex"),
  });
};

const login = async (req, res) => {
  // TODO: Read username, pwd from the req object
  // Check if data is valid
  // Return correct status codes: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
  // If the user is verified, then return a token along with correct status code
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }, (err, foundUser) => {
    if (err) {
      return res
        .status(500)
        .json({ error: `Internal Server Error ${err.message}` });
    }

    if (foundUser === undefined || foundUser == null) {
      return res.status(401).json({ error: `Invalid username or password` });
    }

    bcrypt.compare(password, foundUser.password, async (err, isMatch) => {
      if (err) {
        return res
          .status(500)
          .json({ error: `Internal Server Error ${err.message}` });
      }

      if (isMatch) {
        let token = await Token.findOne({ user: result._id }).exec();
        return res
          .status(200)
          .send(`User successfullylogged in with token ${token.token}`);
      } else {
        return res.status(401).send("Invalid credentials!");
      }
    });
  });
};

const signup = async (req, res) => {
  // TODO: Read username, email, name, password from the req object
  // Hash the password
  // Return with appropriate status code in case of an error
  // If successful, return with an appropriate token along with correct status code

  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  User.find(
    { $or: [{ username: username }, { email: email }] },
    (err, userList) => {
      if (err) {
        return res
          .status(500)
          .json({ error: `Internal Server Error. ${err.message}` });
      } else {
        if (userList.length > 0) {
          return res.status(409).json({
            error:
              "User with given credentials(username/email) already exists.",
          });
        }
        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            return res
              .status(500)
              .json({ error: `Internal Server Error ${err.message}` });
          }
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
              return res
                .status(500)
                .json({ error: `Internal Server Error ${err.message}` });
            }
            const newUser = new User({
              name: name,
              email: email,
              username: username,
              password: hash,
            });
            newUser.save();
            const token = createToken(newUser);
            token.save();
            res.status(200).json({ token: tokenObject.token });
          });
        });
      }
    }
  );
};

const profile = async (req, res) => {
  // TODO:
  // Implement the functionality to retrieve the details
  // of the logged in user.
  // Check for the token and then use it to get user details

  //Token verified using middleware function
  const user = req.user;

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
  });
};

module.exports = { login, signup, profile };
