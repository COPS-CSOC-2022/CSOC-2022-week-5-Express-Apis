const { User, Token } = require("../models");
const { randomBytes } = require("crypto");
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { response } = require("express");

const createToken = (user) => {
  return Token({
    user: user._id,
    token: randomBytes(40).toString("hex"),
  });
};

const login = async (req, res) => {
  // TODO: Read username, pwd from the req object
  // Check if data is valid
  // Return correct status codes: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
  // If the user is verified, then return a token along with correct status code
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    var user = await User.findOne({username: req.body.username});

    if(user){
        var check = await bcrypt.compare(req.body.pwd,user.password);
        if(check){
            let token = await Token.findOne({user:user._id});

            return res.status(200).json({token:token.token});
        }
        else{
            return res.status(401).send("Enter correct username and password!");
        }
    }
    else{
        return res.status(401).send("Enter correct username and password!");
    }}catch(err){
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
};

const signup = async (req, res) => {
  // TODO: Read username, email, name, pwd from the req object
  // Hash the password
  // Return with appropriate status code in case of an error
  // If successful, return with an appropriate token along with correct status code
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] })) {
      return res.status(400).json({ error: "User with same username or email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(req.body.pwd, salt);

    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: hashPass,
    })

    await newUser.save().then(() => {
      console.log(newUser);
      let token = createToken(newUser);
      token.save();
      return res.status(201).json({token:token.token});
    }).catch(err => console.error(err));

  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error")
  }
};

const profile = async (req, res) => {
  // TODO:
  // Implement the functionality to retrieve the details
  // of the logged in user.
  // Check for the token and then use it to get user details
  const authToken = req.header('authorization');
  if(!authToken){
    return res.status(401).send({error:"No Token"});
  }
  
  let token = authToken.split(" ");
  
  if(token.length!==2 || token[0]!=="Token"){
    return res.status(401).send({error:"Invalid Syntax. Use 'Token <token>' instead."});
  }
  
  let foundUser = await Token.findOne({token: token[1]}).populate('user');
  if(!foundUser){
    return res.status(401).send({error:"Invalid Token"});
  }  
  else{
    return res.status(200).json({id:foundUser.user._id,name:foundUser.user.name,username:foundUser.user.username,email:foundUser.user.email});
  }
};

module.exports = { login, signup, profile };
