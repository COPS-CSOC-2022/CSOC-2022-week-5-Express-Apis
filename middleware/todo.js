const Token = require("../models/token");
const User = require("../models/user");

var middlewareObj = {};

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

middlewareObj.hasCorrectTitle = function (req, res, next) {
    if (req.body.title === undefined) {
        return res.status(400).json({
            error: "Missing the required field title for the todo."
        })
    }

    if (req.body.title.trim() === '') {
        return res.status(400).json({
            error: "The title of the todo cannot be blank or just made up of whitespaces."
        })
    }
    next();
}

middlewareObj.hasCollaborator = function (req, res, next) {
    if (!req.body.collaborator) return res.status(400).json({
        error: "Missing required parameter - Username of the collaborator"
    })

    const usernameRegex = /^[\w.@+-]{1,150}$/gm
    if (typeof (username) != 'string' || !usernameRegex.test(req.body.collaborator)) return res.status(400).json({
        error: "Username of the collaborator is invalid."
    });

    next();
}

module.exports = middlewareObj;