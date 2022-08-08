const { Token, User } = require("../models");

var middlewareObj={};
//middleware object to check if logged in
middlewareObj.isLoggedIn=function(req,res,next){
        const header = req.headers.authorization;
        console.log(header);
        const header_title = header.split(' ')[0];
        const token = header.split(' ')[1];
        let poss = true;
        //res.send(header);
        if(header.split(' ').length !== 2){
            poss = false;
        }

        if(header_title!== "Token"){
            poss = false;
        }

        if(!poss){
            return res.status(400).send("Header should be of the format 'Token <token>'");
        }

        Token.findOne({token: token},(err,foundtoken)=>{
            if(!err){
                if(foundtoken!==null){
                    User.findById(foundtoken.user, (error,foundUser)=>{
                        if(!error){
                            if(foundUser){
                                req.user = {
                                    username: foundUser.username,
                                    email: foundUser.email,
                                    id: foundUser.id,
                                    name: foundUser.name
                                };
                                console.log("Validated");
                                return next();
                            }else{
                                return res.status(401).send("User with given token does not exists");
                            }
                        }else{
                            return res.status(500).send(error);
                        }

                    })
                }else{
                    return res.status(401).send("Given Token does not exist");
                }
            }else{
                return res.status(500).send(error);
            }
        })
	}

    module.exports=middlewareObj;