const Token = require("../models/token.js");

const userAuth = async (req, res, next)=>{
    const authToken = req.headers['authorization'];
    const token = authToken.split(' ')[1];
    
    let result = await Token.findOne({token: token}).populate('user').exec();
    if(!result){
      return res.status(401).send("Invalid Token!");
    }
    res.locals.token = result;
    next();
};

module.exports = userAuth;