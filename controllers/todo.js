const { ToDo, Token, User } = require("../models");
// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
  try {
    const todo = await ToDo.find({$or:[
      {createdBy:req.user._id},
      {colab:req.user._id},
    ]})
    if(!todo) res.status(400).json("No Todos Exist for this user")
    else {
      res.status(200).json(todo);
    }
  } catch (error) {
    res.status(500).json("Server Error")
    console.log(error);
  }
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly
  try {
    const newTodo = new ToDo({
      title:req.body.title,
      createdBy:req.user._id,
      colab:[]
    })
    const todo = await newTodo.save();
    if(!todo) res.status(400).json("Server Error");
    else {
      res.status(200).json("Todo created successfully");
    }
  } catch (error) {
    res.status(500).json("Server Error");
    console.log(error);
  }
};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.
  try {
    const todo = await ToDo.findOne({$and:[
      {$or:[
        {createdBy:req.user._id},
        {colab:req.user._id}
      ]},
      {_id:req.params._id}
    ]});
    if(!todo) res.status(404).json("No Todo Found");
    else {
      res.status(200).json(todo);
    }
  } catch (error) {
    res.status(500).json("Server Error");
    console.log(error);
  }
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
  const todo = await ToDo.findOne({$and:[
    {_id:req.params._id},
    {$or:[
      {createdBy:req.user._id},
      {colab:req.user._id},
    ]}
  ]})
  if(!todo) res.status(404).json("No Todo Found");
  else{
    const edit = await ToDo.findByIdAndUpdate(req.params._id,{
      title:req.body.title
    },function(err,docs) {
      if(err) res.status(400).json(err);
      else {
        res.status(200).json(docs.title);
      }
    })
  }
};

const editToDoPatch = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response
  const todo = await ToDo.findOne({$and:[
    {_id:req.params._id},
    {$or:[
      {createdBy:req.user._id},
      {colab:req.user._id},
    ]}
  ]})
  if(!todo) res.status(404).json("No Todo Found");
  else{
     ToDo.findByIdAndUpdate(req.params._id,{
      title:req.body.title
    },function(err,docs) {
      if(err) res.status(400).json(err);
      else {
        res.status(200).json(docs.title);
      }
    })
  }
};

const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
const todo = await ToDo.findOne({$and:[
    {_id:req.params._id},
    {$or:[
      {createdBy:req.user._id},
      {colab:req.user._id},
    ]}
  ]})
  if(!todo) res.status(404).json("No Todo Found");
  else{
  ToDo.findByIdAndDelete(req.params._id,function(err,docs) {
      if(err) res.status(400).json(err);
      else {
        res.status(200).json("Deleted Successfully");
      }
    })
  }
};

const addColab =async(req,res)=>{
  try {
    const todo = await ToDo.findOne({$and:[
      {createdBy:req.user._id},
      {_id:req.params._id},
    ]})
    if(!todo) res.status(404).json("No todo found");
    const user = await User.findOne({username:req.body.username});
    if(!user) res.status(404).json("No user found");
    else {
      if(req.user._id === user._id) res.status(400).json("Can't add the creator as collaborator");
      else {
        function search(a) {
          return a === user._id;
        }
        const colabs = todo.colab;
        const x= colabs.find(search);
        if(x) res.status(400).json("Can't add an existing collaborator");
        else {
          ToDo.findByIdAndUpdate(req.params._id,{$push:{colab:user._id}}, function(err,docs) {
            if(err) res.status(400).json(err.message);
            else { res.status(200).json("User add successfully")}
          })
        }
      }
    }
  } catch (error) {
    res.status(500).json("Server Error")
    console.log(error);
  }
}
 const removeColab = async(req,res)=>{
  try {
    const todo = await ToDo.findOne({$and:[
      {createdBy:req.user._id},
      {_id:req.params._id},
    ]})
    if(!todo) res.status(404).json("No todo found");
    const user = await User.findOne({username:req.body.username});
    if(!user) res.status(404).json("No user found");
    else {
      if(req.user._id === user._id) res.status(400).json("Can't remove the creator as collaborator");
      else {
        function search(a) {
          return a === user._id;
        }
        const colabs = todo.colab;
        const x= colabs.find(search);
        if(!x) res.status(400).json("Can't remove a non existing collaborator");
        else {
          ToDo.findByIdAndUpdate(req.params._id,{$pull:{colab:user._id}}, function(err,docs) {
            if(err) res.status(400).json(err.message);
            else { res.status(200).json("User removed successfully")}
          })
        }
      }
    }
  } catch (error) {
    res.status(500).json("Server Error")
    console.log(error);
  }
 }
module.exports = {
  createToDo,
  deleteToDo,
  editToDo,
  editToDoPatch,
  getAllToDo,
  getParticularToDo,
  addColab,
  removeColab
};
