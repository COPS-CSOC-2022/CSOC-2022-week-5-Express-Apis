const { isValidUsername, isValidPassword, isValidEmail, isValidName } = require('../utils/validators');
const Token = require('../models/token');
const User = require('../models/user');

var middlewareObj = {};

middlewareObj.hasUsernameAndPassword = function (req, res, next) {
    if (!(req.body.username && req.body.password)) {
        return res.status(400).json({
            error: "Missing required fields (username or password)"
        });
    }
    return next();
}

middlewareObj.isValidSignUpRequest = function (req, res, next) {
    if (!(req.body.username && req.body.password && req.body.email && req.body.name)) {
        return res.status(400).json({
            error: "Missing required fields (username, password, email or name)."
        });
    }

    if (!isValidUsername(req.body.username)) return res.status(400).json({
        error: "Username is invalid."
    });
    if (!isValidPassword(req.body.password)) return res.status(400).json({
        error: "Password is invalid."
    });
    if (!isValidEmail(req.body.email)) return res.status(400).json({
        error: "Email is invalid."
    });
    if (!isValidName(req.body.name)) return res.status(400).json({
        error: "Name is invalid."
    });

    return next();
}

middlewareObj.isAuthorized = function (req, res, next) {
    let authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(' ')[0].toLowerCase() == 'token' && authHeader.split(' ').length == 2) {
        req.token = authHeader.split(' ')[1];
        return middlewareObj.addUserToRequest(req, res, next);
    }
    else {
        return res.status(401).json({
            error: 'Incorrect headers for the request. Authorization failed. '
        });
    }
}

middlewareObj.addUserToRequest = function (req, res, next) {
    Token.findOne({
        'token': req.token
    }, 'user', (err, token) => {

        if (err) {
            console.log(err);
            res.status(500).json({
                error: 'Something went wrong with your request. \n' + err.message
            });
        }

        if (token == null) {
            return res.status(401).json({
                error: "Invalid Token used for authorization."
            });
        }

        User.findById(token.user, '_id name email username', (err, user) => {
            if (user == null) {
                return res.status(404).json({
                    error: "User not found for this token."
                });
            }

            req.user = user;
            next();
        });
    });
}

module.exports = middlewareObj;