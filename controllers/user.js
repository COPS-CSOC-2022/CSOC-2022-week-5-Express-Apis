const { User, Token } = require("../models");
const { randomBytes } = require("crypto");

const createToken = (user) => {
  return Token({
    user: user._id,
    token: randomBytes(40).toString("hex"),
  });
};

const login = (req, res) => {
  User.findOne(
    {
      username: req.body.username,
    },
    function (err, user) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: "Something went wrong with your request.\n" + err.message,
        });
      }

      if (!user)
        return res.status(401).json({
          message: "Incorrect username or password.",
        });

      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            error: "Something went wrong with your request.\n" + err.message,
          });
        }

        if (isMatch) {
          Token.findOne({ user: user.id })
            .then((token) => res.status(200).json({ token: token.token }))
            .catch((err) => {
              console.log(err.message);
              return res.status(500).json({
                error:
                  "Something went wrong with your request.\n" + err.message,
              });
            });
        } else
          return res.status(401).json({
            message: "Incorrect username or password.",
          });
      });
    }
  );
};

const signup = (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then((user) => {
      createToken(user)
        .save()
        .then((tokenObject) => {
          return res.status(200).json({ token: tokenObject.token });
        })
        .catch((err) => {
          return res.status(500).json({
            error:
              "Something went wrong in the token generation for your user. \n" +
              err.message,
          });
        });
    })
    .catch((err) => {
      if (err.errors.username && err.errors.username.kind == "unique") {
        return res.status(409).json({
          error: "Username is already in use. ",
        });
      }
      if (err.errors.email && err.errors.email.kind == "unique") {
        return res.status(409).json({
          error: "Email is already in use. ",
        });
      }
      console.log(err);
      return res.status(500).json({
        error: "Something went wrong with your request.\n" + err.message,
      });
    });
};

const profile = (req, res) => {
  const user = req.user;

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
  });
};

module.exports = { login, signup, profile };
