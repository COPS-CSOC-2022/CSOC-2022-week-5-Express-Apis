const { Token } = require("../models");

const auth = async function(req,res,next){
const token = req.header('authorisation');
if(!token) res.status(404).json("Token not found");
const tok = token.split(" ");
if(tok.length !==2 || tok[0]!=="Token") {
    res.status(406).json("Invalid Token");
}

const user = await Token.findOne({token:tok[1]});
if(user){
    user = user.populate('user');
    req.user = user.user;
   return next();
}
else {
    res.status(400).json("Invalid Token");
}
}
module.exports = auth;