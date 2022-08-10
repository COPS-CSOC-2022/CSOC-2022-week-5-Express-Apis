const express = require('express');
const Token = require('../models/token')

const checkUser = async function (req, res, next) {
    const authToken = req.header('authorization');

    if (!authToken) {
        return res.status(401).send({ error: "No Token" });
    }

    let token = authToken.split(" ");

    if (token.length !== 2 || token[0] !== "Token") {
        return res.status(401).send({ error: "Invalid Syntax. Use 'Token <token>' instead." });
    }

    let found = await Token.findOne({token:token[1]}).populate('user');
    if(!found)return res.status(401).send({ error: "Invalid Token" });
    else{
        req.user = found.user;
        return next();
    }

}
module.exports = checkUser;