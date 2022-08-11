const { User, Token } = require("../models");
const { randomBytes } = require("crypto");
const bcrypt=  require('bcrypt')
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
  try {
    const body = req.body;
    var user = await User.findOne({username : body.username})
    if(!user){
     return res.status(404).json("User with this username does not exist");
    }
    else {
      const auth = await bcrypt.compare( body.pwd , user.pwd );
      if(auth){
        const token = await Token.findOne({user:user._id})
        res.status(200).json(token.token);
      }
      else{
        return res.status(401).json("Wrong Password");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const signup = async (req, res) => {
  // TODO: Read username, email, name, pwd from the req object
  // Hash the password
  // Return with appropriate status code in case of an error
  // If successful, return with an appropriate token along with correct status code
  // res.status(200).json(req.body);
  try {
    const exist = await User.findOne({$or:[
      {'username':req.body.username},
      {'email':req.body.email},
    ]})
    if(exist) res.status(400).json("A user with this username or email already exist");
    else {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.pwd,salt);
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        pwd: hashedPass,
      });
     
      const user = await newUser.save();
      const token = createToken(newUser);
      res.status(201).json(token.token);
  
    }
  } 
  catch (error) {
    res.status(500).json("Server error");
    console.log(error);
  }
  
};

const profile = async (req, res) => {
  // TODO:
  // Implement the functionality to retrieve the details
  // of the logged in user.
  // Check for the token and then use it to get user details
  try {
    const token = req.header('authorisation');
  if(!token) res.status(401).json("No authorisation token is present");
  const tok = token.split(" ");
  if(tok[0]!=="Token"  || tok.length!==2 ) res.status(406).json("Invalid Token");
  else {
    const user = await Token.findOne({token : tok[1]});
    user =user.populate('user');
    user = user.user
    if(user) res.status(200).json({id:user._id,name:user.name,username:user.username,email:user.email})
    else{
      res.status(400).json("Invalid token");
    }
  }
  } catch (error) {
    res.status(500).json("Server error")
    console.log(error);
  }
  
};

module.exports = { login, signup, profile };
