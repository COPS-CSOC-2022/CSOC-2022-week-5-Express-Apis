const mongoose = require('mongoose');

const isValidUsername = (username) => {
    if (typeof (username) != 'string') return false;
    const usernameRegex = /^[\w.@+-]{1,150}$/gm
    return usernameRegex.test(username);
}

const isValidPassword = (password) => {
    return typeof (password) == 'string';
}

const isValidEmail = (email) => {
    if (typeof (email) != 'string') return false;
    const emailRegex = /^\S+@\S+/gm;
    return emailRegex.test(email);
}

const isValidName = (name) => {
    return typeof (name) == 'string' && name.length >= 1
}

const hasValidId = (req, res, next) => {
    if (!req.params.id) return res.status(400).json({
        error: "Missing required parameter - ID of the todo"
    })
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            error: "ID of the todo is invalid."
        });
    }
    next();
}


module.exports = {
    isValidUsername,
    isValidPassword,
    isValidEmail,
    isValidName,
    hasValidId
}