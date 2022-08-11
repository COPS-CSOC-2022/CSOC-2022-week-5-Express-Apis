const { response } = require("express");
const { ToDo, Token, User } = require("../models");

// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
  try{
  let all = await ToDo.find({$or:[{createdBy: req.user._id},{collaborators:req.user._id}]});
  var arr = []
  for(a of all){
    arr.push({id:a._id,title:a.title})
  }
  res.status(200).json(arr);
  }catch(err){
    console.log(err)
    res.status(500).send("Internal Server Error")
  }
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly
  const user = req.user;
  const title = req.body.title;

  let toDo = new ToDo({
    title: title,
    createdBy:user._id,
    collaborators:[]
  });

  await toDo.save().then(() => {
    return res.status(200).json({id:toDo._id,title:title});
  }).catch(err => {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  });
};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.
  try{
    const toDo = await ToDo.findOne({$and:[{$or:[{createdBy:req.user._id},{collaborators:req.user._id}]},{_id: req.params.id}]});
    if(!toDo){
      return res.status(404).send("No ToDo found with that id")
    }
    else{
      return res.status(200).send({id:toDo._id,title:toDo.title});
    }
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
  try{
      const title = req.body.title;
      const toDo = await ToDo.findOne({$and:[{_id:req.params.id},{$or:[{createdBy:req.user._id},{collaborators:req.user._id}]}]});
      if(!toDo){
        return res.status(404).send("ToDo not found")
      }
      else{
        await ToDo.findByIdAndUpdate(req.params.id,{$set:{title:title}});
        return res.status(200).send({id:req.params.id,title:title});
      }
    }catch(err){
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  
  const editToDoPatch = async (req, res) => {
    // Change the title of the Todo with given id, and get the new title as response
    try{
      const title = req.body.title;
      const toDo = await ToDo.findOne({$and:[{_id:req.params.id},{$or:[{createdBy:req.user._id},{collaborators:req.user._id}]}]});
      if(!toDo){
        return res.status(404).send("ToDo not found")
      }
      else{
        await ToDo.findByIdAndUpdate(req.params.id,{$set:{title:title}});
        return res.status(200).send({id:req.params.id,title:title});
      }
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
  try{
    const toDo = await ToDo.findOne({$and:[{_id:req.params.id},{$or:[{createdBy:req.user._id},{collaborators:req.user._id}]}]});
    if(!toDo){
      return res.status(404).send("ToDo not found")
    }
    else{
      await ToDo.findByIdAndDelete(req.params.id);
      return res.status(204).send("Deleted successfully");
    }
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const addCollaborator = async (req, res) => {
  try{
    const toDo = await ToDo.findOne({$and:[{_id:req.params.id},{createdBy:req.user._id}]});
    if(!toDo){
      return res.status(404).send("ToDo not found");
    }
    const user = await User.findOne({username:req.body.username})
    if(!user){
      return res.status(404).send("No user found with that username");
    }
    if(req.body.username==req.user.username){
        return res.status(400).send("Creator cannot be a collaborator");
      }
      
      for(i of toDo.collaborators){
        if(user._id.toString() == i.toString()){
          return res.send("Given user is already a Collaborator");
        }}
        
        await ToDo.findByIdAndUpdate(req.params.id,{$push:{collaborators:user._id}});
        return res.status(200).send("User added as Collaborator")
      }catch(err){
        console.log(err);
        return res.status(500).send("Internal Server Error");
      }
    }
    
    const removeCollaborator = async(req, res) => {
      try{
        const toDo = await ToDo.findOne({$and:[{_id:req.params.id},{createdBy:req.user._id}]});
        if(!toDo){
          return res.status(404).send("ToDo not found");
        }
        const user = await User.findOne({username:req.body.username});
        if(!user){
          return res.status(404).send("No user found with that username");
        }
        if(req.body.username==req.user.username){
            return res.status(400).send("Creator cannot be a removed");
          }
          for(i of toDo.collaborators){
            if(i.toString()==user._id.toString()){
              await ToDo.findByIdAndUpdate(req.params.id,{$pull:{collaborators:i}})
              return res.status(200).send("Collaborator removed successfully")
            }
          }
          return res.status(400).send("Given user is not a Collaborator for this todo");
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createToDo,
  deleteToDo,
  editToDo,
  editToDoPatch,
  getAllToDo,
  getParticularToDo,
  addCollaborator,
  removeCollaborator
};
