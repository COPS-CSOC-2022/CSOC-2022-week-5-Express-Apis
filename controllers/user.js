const { User, Token } = require("../models");
const { randomBytes } = require("crypto");
const bcrypt = require("bcrypt");

const createToken = (user) => {
  return new Token({
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
  const pwd = req.body.password;

  if(username.length===0 || pwd.length===0){
    return res.status(400).send("Please fill the credentials.");
  }else{
    User.findOne({username: username}, (err,foundUser)=>{
      if(!err){
        if(foundUser){
        const check = bcrypt.compareSync(pwd,foundUser.password);
        console.log(check);
        if(check){
          Token.findOne({user:foundUser.id},(error, foundToken)=>{
            if(!error){
              res.status(200).send("Token " + foundToken);
            }else{
              res.status(401).send("Incorrect Password or Username");
            }
          })
        }else{
          res.status(401).send("Incorrect Password or Username");
        }}else{
          res.status(401).send("Incorrect Password or Username");
        }
      }else{
        res.status(401).send("Incorrect Password or Username");
      }
    }); 
  }

  
};
const registerFieldsAreValid=(req,res,next) =>{
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  if (name==='' || email === '' || username === '' || password === '') {
      return res.status(400).send("Please fill all the fields correctly.");
      
  }
  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
    return res.status(400).send("Please fill valid Email.");
        
  }
  next();
}

const  validator = (schema)=>{
  console.log("valid  ");
  return (req,res,next)=>{
    for(let obj in schema){
      if(req.body[obj]===null){
        return res.status(400).send(obj+" missing");
      }
      if(typeof(req.body[obj])!==schema[obj]){
        return res.status(400).send(obj+" should be of type "+schema[obj]);
      }
    }
    next();
  }

}

const signup = async (req, res) => {
  // TODO: Read username, email, name, pwd from the req object
  // Hash the password
  // Return with appropriate status code in case of an error
  // If successful, return with an appropriate token along with correct status code
  console.log("sign   ")
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const pwd = req.body.password;
  const saltRounds = 10;
  
  User.find({$or:[{username:username},{email: email}]},(err,foundUser)=>{
    if(!err){
      console.log("found",foundUser);
      if(foundUser.length!==0)
      return res.status(401).send("User with given credentials already exists");
      else{
        bcrypt.genSalt(saltRounds, function(err, salt) {
          bcrypt.hash(pwd, salt, function(err, hash) {
            const newUser = new User({
              name: name,
              email : email,
              username: username,
              password: hash
            })
            newUser.save();
            const token =  createToken(newUser);
            token.save();
            console.log(hash);
            res.status(200).send("Signed Up "+ req.body.username +" Succesfully "+hash);
          });
      });
        
      }
    }else{
      console.log(err);
    }
  })
 
  
        
    
     
   }


const profile = async (req, res) => {
  // TODO:
  // Implement the functionality to retrieve the details
  // of the logged in user.
  // Check for the token and then use it to get user details
  
  
  //Token verified using middleware function

  // console.log("here");
   console.log(req.user);
   //res.send("hi");
  res.status(200).json(req.user);

};

module.exports = { login, signup, profile, validator, registerFieldsAreValid };
