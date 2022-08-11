const { User, Token } = require("../models");
var middlewareObject = {};

middlewareObject.isLoggedIn= (req,res,next)=>{
    
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if(authHeader.split(' ').length!==2 || authHeader.split(' ')[0]!=='Token'){
        res.status(400).send('Invalid Token type! It should be of the form "Token <Token> "!');
    }
    const token = authHeader.split(' ')[1];
    Token.findOne({token: token},(err,foundToken)=>{
        if(!err && foundToken){
            User.findById(foundToken.user,(err,foundUser)=>{
                if(!err && foundUser){
                    // console.log("User exists!");
                    // console.log(foundUser);
                    req.loggedInUser = {
                        username: foundUser.username,
                        name: foundUser.name,
                        id: foundUser._id,
                        email: foundUser.email,
                    };
                    
                    return next();
                }
                else if(!foundUser) res.status(401).send("User not found!");
                else  res.send(500).status("Something went wrong!");
            })
        }
        else if(!foundToken) res.status(401).send("Token not found!");
        else  res.send(500).status("Something went wrong!");
    })

}

module.exports = middlewareObject;