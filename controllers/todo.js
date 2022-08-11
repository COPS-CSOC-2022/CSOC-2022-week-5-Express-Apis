const { ToDo, Token ,User} = require("../models");

// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
  
  const token = req.headers.authorization.split(' ')[1];
  //token auth is handled by Middleware
  
  ToDo.find({ $or : [{createdBy: req.loggedInUser.id}, {collabedBy: req.loggedInUser.id}]} ,(err,foundTodos)=>{
    if(!err){
      if(foundTodos){
                
        res.send({
          "Created / Collabbed Todos: ": foundTodos.map((todo)=>({
            id: todo.id,
            title: todo.title,
            createdBy: todo.createdBy,
            collabedBy: todo.collabedBy
          }))
        });
        
      } 
      else res.status(404).send("No todos found!!");
    } 
    else res.status(500).send(err);
  });
  
  
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly
  const title= req.body.title;
  const newtodo = new ToDo ({
    title: title,
    createdBy: req.loggedInUser.id,
    collabedBy: []
  })
  newtodo.save()
  .then(res.status(200).send("Todo created successfully!"))
  .catch((err)=>{if(err) res.status(500).send("Something went wrong.")});

};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.
  const todoId = req.params.id;
  // console.log(todoId);
  ToDo.findById(todoId,(err,foundTodo)=>{
    if(!err && foundTodo) {
      if(toString(foundTodo.createdBy)!=toString(req.loggedInUser.id)) {
        res.status(400).send("Unauthorized to view!!");
      }
      else res.status(200).json(foundTodo);
    }
    else if(!foundTodo) res.status(404).send("No such Todo exists!"); 
    else res.status(500).send("Something went wrong.");
  })
};

const editToDoPatch = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response
  const todoId = req.params.id;
  const newTitle= req.body.title;
  ToDo.findById(todoId,(err,foundTodo)=>{
    if(!err && foundTodo) {
      if(toString(foundTodo.createdBy)!=toString(req.loggedInUser.id)) res.status(400).send("Unauthorized to edit!!")
      else {
        foundTodo.title=newTitle;
        foundTodo.save().then(res.status(200).send("Edited successfully!"));
      }
    }
    else if(!foundTodo) res.status(404).send("No such Todo exists!"); 
    else res.status(500).send("Something went wrong.");
  })
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
  editToDoPatch(req,res);
};



const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
  const todoId = req.params.id;
  ToDo.findById(todoId,(err,foundTodo)=>{
    if(!err && foundTodo) {
      if(toString(foundTodo.createdBy)!=toString(req.loggedInUser.id)) res.status(400).send("Unauthorized to delete!!")
      else {
        ToDo.findByIdAndDelete(todoId,(err,foundIt)=>{
          if(err) res.status(500).send("Something went wrong.");
          else {
            if(foundIt) res.status(200).send("Deleted successfully!!"); 
          }
        })
      }
    }
    else if(!foundTodo) res.status(404).send("No such Todo exists!"); 
    else res.status(500).send("Something went wrong.");
  })
};

const addCollaborator = async (req, res) => {
  const todoId = req.params.id;
  const newCollaborator = req.body.collaborator;
  console.log(todoId);
  User.findOne({username:newCollaborator},(err,foundUser)=>{
      if(!err){
        if(foundUser){
          console.log(foundUser);
          if(toString(foundUser.id)!=toString(req.loggedInUser.id)){
            return res.status(400).send("Creater cannot be a collaborator!");
          }
            ToDo.findById(todoId,(err,foundTodo)=>{
              if(!err){
                if(foundTodo){
                  if(toString(foundTodo.createdBy)!=toString(req.loggedInUser.id)){
                    return res.status(401).send("Unauthorized to add a collaborator!!");
                  }
                  console.log(foundUser.id);
                  if(foundTodo.collabedBy && foundTodo.collabedBy.includes(foundUser.id)){
                    return res.status(400).send("Given user is already a collaborator!!");
                  }
                if(foundTodo.collabedBy){
                  foundTodo.collabedBy.push(foundUser.id);
                }else{
                  foundTodo.collabedBy = [foundUser.id];
                }

                foundTodo.save().then(res.status(200).send("Collaborator added!")).catch(err=>res.status(500).send(err));
            }else{
              return res.status(404).send("No such Todo Exists!");
            }
            }else{
              res.status(500).send(err);
            }
            })
        }else{
          return res.status(404).send("User Not Found!!");
        }
      }else{
        return res.status(500).send(err);
      }

  })
}

const removeCollaborator = async (req,res) => {
  const todoId = req.params.id;
  const collaborator = req.body.collaborator;
  console.log(collaborator);
  User.findOne({username:collaborator},(err,foundUser)=>{
      if(!err){
        if(foundUser){
          console.log(foundUser);
          if(toString(foundUser.id)!=toString(req.loggedInUser.id)){
            return res.status(400).send("Creater was'nt a Collaborator!!");
          }
            ToDo.findById(todoId,(err,foundTodo)=>{
              if(!err){
                if(foundTodo){
                  console.log(foundUser.id)
                  if(toString(foundTodo.createdBy)!=toString(req.loggedInUser.id)){
                    return res.status(401).send("Unauthorized to remove collaborators!!");
                  }
                  if(foundTodo.collabedBy && foundTodo.collabedBy.includes(foundUser.id)){
                    foundTodo.collabedBy.splice(foundTodo.collabedBy.findIndex((user)=>{user==foundUser.id}));
                  }else{
                    return res.status(404).send("No such collaborator exists!");
                  }

                foundTodo.save().then(res.status(200).send("Succesfully removed the collaborator!!")).catch(err=>res.status(500).send(err));
            }
            else{
              return res.status(404).send("No such Todo exists!");
            }
            }
            else{
              res.status(500).send(err);
            }
            })
        }else{
          return res.status(404).send("User Not Found!!");
        }
      }else{
        return res.status(500).send(err);
      }

  })

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
