const { ToDo, Token } = require("../models");
const User = require("../models/user.js");
const Todo = require("../models/todo.js");
const checker = require('mongoose').Types.ObjectId.isValid;

// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
  let result = await Todo.find({
    $or: [{createdBy: res.locals.token.user._id}, {collaborators: res.locals.token.user._id}
    ]}, "_id title").exec();
  res.status(200).json(result);
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly
  let todo = new Todo({
    title: req.body.title,
    createdBy: res.locals.token.user._id,
    collaborators: []
  });
  
  await todo.save();
  res.status(200).json({id: todo._id, title: todo.title});
};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.
  if(checker(req.params.id)){
    let result = await Todo.findOne({
      $and: [{_id: req.params.id}, {$or: [{collaborators: res.locals.token.user._id}, {createdBy: res.locals.token.user._id}]}]
    }, "_id title").exec();

    return res.status(200).json(result);
  }
  else{
    return res.status(400).send("Invalid todo id!");
  }
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
  if(checker(req.params.id)){
    let result = await Todo.findOne({
      $and: [
              {_id: req.params.id},
              {$or: [{createdBy: res.locals.token.user._id}, {collaborators: res.locals.token.user._id}]}
            ]}
      , "_id title").exec();

    if(result){
      result.title = req.body.title;
      await result.save();
      res.status(200).json({id: result._id, title: result.title});
    }
    else{
      return res.status(400).send("Either todo id incorrect or you dont have edit rights!");
    }
  }
  else{
    return res.status(400).send("Invalid todo id!");
  }
};

const editToDoPatch = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response
  if(checker(req.params.id)){
    let result = await Todo.findOne({
      $and: [
              {_id: req.params.id},
              {$or: [{createdBy: res.locals.token.user._id}, {collaborators: res.locals.token.user._id}]}
            ]}
      , "_id title").exec();

    if(result){
      result.title = req.body.title;
      await result.save();
      res.status(200).json({id: result._id, title: result.title});
    }
    else{
      return res.status(400).send("Either todo id incorrect or you dont have edit rights!");
    }
  }
  else{
    return res.status(400).send("Invalid todo id!");
  }
};

const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
  if(checker(req.params.id)){
    let result = await Todo.findOne({
      $and: [
              {_id: req.params.id},
              {$or: [{createdBy: res.locals.token.user._id}, {collaborators: res.locals.token.user._id}]}
            ]}).exec();
    if(result){
      await result.remove();
      res.status(200).send("todo deleted!");
    }
    else{
      return res.status(400).send("Either todo id incorrect or you dont have delete rights!");
    }
  }
  else{
    return res.status(400).send("Invalid todo id!");
  }
};

const addCollaborators = async (req, res)=>{
  if(checker(req.params.id)){
    let username = req.body.username;
    let result = await Todo.findOne({$and: [{_id: req.params.id}, {createdBy: res.locals.token.user._id}]}).exec();
    let user = await User.findOne({username}).exec();
    
    if(!user){
      return res.staus(400).send(`User ${username} doesnt exist`);
    }
    if(result){
      for(let i=0; i<result.collaborators.length; i++){
        if(String(user._id) == String(result.collaborators[i])){
          return res.send("collaborator Already exists!");
        }
      }
      result.collaborators.push(user._id);
      await result.save();
      return res.status(200).send("collaborator added!");
    }
    else{
      return res.status(401).send("Either todo id incorrect or you dont have adding collaborators rights!");
    }
  }
  else{
    return res.status(400).send("Invalid todo id!");
  }
};


const removeCollaborators = async (req, res)=>{
  if(checker(req.params.id)){
    let username = req.body.username;
    let result = await Todo.findOne({$and: [{_id: req.params.id}, {createdBy: res.locals.token.user._id}]}).exec();
    let user = await User.findOne({username}).exec();
    
    if(!user){
      return res.status(400).send("Collaborator not found!");
    }
    if(result){
      for(let i=0; i<result.collaborators.length; i++){
        if(String(user._id) == String(result.collaborators[i])){
          result.collaborators.pop(i);
          await result.save();
          return res.status(200).send("collaborator removed!");
        }
      }
      return res.status(400).send("Collaborator not found!");
    }
    else{
      return res.status(401).send("Either todo id incorrect or you dont have removing collaborators rights!");
    }
  }
  else{
    return res.status(400).send("Invalid todo id!");
  }
};

module.exports = {
  createToDo,
  deleteToDo,
  editToDo,
  editToDoPatch,
  getAllToDo,
  getParticularToDo,
  addCollaborators,
  removeCollaborators,
};