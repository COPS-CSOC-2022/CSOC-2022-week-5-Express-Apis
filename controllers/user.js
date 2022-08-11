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
  const password= req.body.password;

  if(username && password){
    User.findOne({username: username},(err,foundUser)=>{
      if(err) console.log(err);
      else if(foundUser) {
        const validPass = bcrypt.compare(password,foundUser.password);
        if(validPass) {
          Token.findOne({user: foundUser._id},(err,foundToken)=>{
            if(!err){
              if(foundToken) {
                console.log("Token "+foundToken);
                res.status(200).send("Login Successfull!!");
              }
              else res.status(401).send("Token not found!");
            }
            else console.log(err);
             
          })
          
        }
        else res.status(400).send("Invalid Password!!");
      }
      else {
        res.status(401).send("User does'nt exist. :(");
      }
    })
  }
  else res.send("Please fill the credentials first!");
};

const signup = async (req, res) => {
  // TODO: Read username, email, name, pwd from the req object
  // Hash the password
  // Return with appropriate status code in case of an error
  // If successful, return with an appropriate token along with correct status code
  const username=req.body.username;
  const email=req.body.email;
  const name=req.body.name;
  const password= req.body.password;

  if (!(username && name && email && password)) {
    return res.status(400).send({ error: "Please enter valid credentials!!" });
  }

  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!(validRegex.test(email))) {
    return res.status(400).send("Email Address not valid :(");

  }
  const saltRounds=10;

  User.findOne({$or: [{username:username},{email: email}]},(err,foundUser)=>{
    if(err) console.log(err);
    else{
      if(foundUser) res.status(400).send({error: "User already exists!!"});
      else {
        bcrypt.genSalt(saltRounds, function(err, salt) {
          if(!err){
              bcrypt.hash(password, salt, function(err, hash) {
                if(err) console.log(err);
                else {
                  console.log("Hash "+hash);
                  const newUser= new User({
                    name: name,
                    email: email,
                    username: username,
                    password: hash,
                    
                  })
                  newUser.save();
                  const newToken = createToken(newUser);
                  newToken.save();
                  
                  res.status(200).send("Succesfully registered!!");
                }
              });
            } else console.log(err);
          
        });

      }
    }
  })
};

const profile = async (req, res) => {
  // TODO:
  // Implement the functionality to retrieve the details
  // of the logged in user.
  // Check for the token and then use it to get user details

  //Token checked by Middleware
  // Just printing out the json object of loggedInUser
  console.log(req.loggedInUser);
  res.send(req.loggedInUser);
};

module.exports = { login, signup, profile };
