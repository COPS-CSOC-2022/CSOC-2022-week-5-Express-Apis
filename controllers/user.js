const { User, Token } = require("../models");
const { randomBytes } = require("crypto");
const bcrypt = require("bcrypt");

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
  const username = req.body.username;
  const password = req.body.pwd;
  let result = await User.findOne({username: username}).exec();
  if(!result){
    return res.status(401).send("Invalid username!");
  }
  bcrypt.compare(password, result.password, async (err, result2)=>{
    if(result2){
      let token = await Token.findOne({user: result._id}).exec();
      return res.status(200).send(`Success! user loggen in with token ${token.token}`);
    }
    else{
      return res.status(401).send("Invalid credentials!");
    }
  });
};

const signup = async (req, res)=>{
  // TODO: Read username, email, name, pwd from the req object
  // Hash the password
  // Return with appropriate status code in case of an error
  // If successful, return with an appropriate token along with correct status code
  
  //perform some security checks
  if(!req.body.name || !req.body.email || !req.body.username || !req.body.pwd){
    return res.status(422).send("Values cant be null!");
  }
  
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.pwd;
  
  
  let result = await User.findOne({$or: [{email: email}, {username: username}]}).exec();
  if(result){
    return res.status(422).send("user already exists");
  }
  
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async (err, hash)=>{
    let new_user = new User({
      name: name,
      email: email,
      username: username,
      password: hash
    });
    
    await new_user.save();
    
    let token = createToken(new_user);
    await token.save();
    return res.status(201).send(`Success! user has been created with token ${token.token}`);
  });
};

const profile = async (req, res) => {
  // TODO:
  // Implement the functionality to retrieve the details
  // of the logged in user.
  // Check for the token and then use it to get user details
  const authToken = req.headers['authorization'];
  const token = authToken.split(' ')[1];
  
  let result = await Token.findOne({token: token}).populate('user').exec();
  if(!result){
    return res.status(401).send("Invalid Token");
  }
  let user = {
    username: result.user.username,
    name: result.user.name,
    email: result.user.email,
    createdAt: result.user.createdAt
  }
  return res.status(200).json(user);
};

module.exports = { login, signup, profile };
