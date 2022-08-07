const { ToDo, Token, User } = require("../models");

// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
  ToDo.find({ $or : [{createdBy: req.user.id}, {collab: req.user.id}]},
    (err,foundTodos)=>{
      if(!err){
        if(foundTodos){
          console.log(req.user.id);
          const TodosCreated = foundTodos.filter((todo)=>todo.createdBy==req.user.id);
          const TodosCollabed = foundTodos.filter((todo)=>todo.createdBy!=req.user.id);
          const users = TodosCollabed.map((todo)=>todo.createdBy);
          console.log(users);
          User.find({_id: {$in: users}},(error,foundUsers)=>{
            if(!error){
              if(foundUsers)
                res.status(200).json({
                  "Todos Created: ": TodosCreated.map((todo)=>({
                    id: todo.id,
                    title: todo.title,
                  })),
                  "Todos Collaborated: ": TodosCollabed.map((todo)=>({
                    id: todo.id,
                    title: todo.title,
                    createdBy: foundUsers.find(foundUser=>todo.createdBy==foundUser.id).username
                  }))
              });else{
                    return res.status(404).send("User Not found");
              }
           }else{
            return res.status(500).send(error);
           }

          })
          
        }else{
          return res.status(404).send("Todo Not found");
        }
      }else{
        return res.status(500).send(err);
      }
    })
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly
  const title = req.body.title;
  const todo = new ToDo({
      title: title,
      createdBy: req.user.id,
      collab: []
  })
  console.log(todo);
  todo.save()
  .then(res.status(200).json({
    title: title,
    createdBy: req.user.username
  }))
  .catch(err=>{if(err)res.status(500).send(err)});
};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.
  const TodoID = req.params.id;
  ToDo.findById({_id: req.params.id},(err,foundTodo)=>{
    if(!err){
      if(foundTodo){
        User.find({_id: {$in: foundTodo.collab}},(err,foundUsers)=>{
          if(!err){
            if(foundUsers)
              res.status(200).json({
               title: foundTodo.title,
               createdBy: foundTodo.createdBy,
               collaborators: foundUsers.map((user)=>user.username)
            })
         }else{
          console.log(err);
         }})}else{
        return res.status(404).send("Todo Not found");
      }
    }else{
     return  res.status(500).send(err);
    }
  })
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
  const title=req.body.title;
  ToDo.findById(req.params.id,(err,foundToDo)=>{
    if(!err){
      if(foundToDo){
        console.log(foundToDo);
        if(foundToDo.createdBy!=req.user.id){
          return res.status(401).send("Unauthorized To Edit this Todo");
        }else{
          foundToDo.title = title;
          foundToDo.save().then(res.status(200).json({
            title : foundToDo.title,
            createdBy : req.user.username,
            collaborators: foundToDo.collaborator
          }))
        }
      }else{
        return res.status(404).send("Todo Not Found");
      }
    }else{
      return res.status(500).send(err);
    }
  })
};

const editToDoPatch = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response
  editToDo();
};

const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
  const ToDoId = req.params.id;

  ToDo.findById(ToDoId,(err,foundTodo)=>{
      if(!err){
        if(foundTodo){
            if(foundTodo.createdBy!=req.user.id){
              return res.status(401).send("Not authorized to delete this todo");
            }else{
              ToDo.findByIdAndDelete(ToDoId, (err,foundToDo)=>{
                if(err){
                  res.status(500).send(err);
                }else{
                  res.status(200).send("Todo Deleted Successfully");
                }
              });
            }
        }else{
          return res.status(404).send("Todo Not Found");
        }
      }else{
        return res.status(500).send(err);
      }
  })

  
  

};

const addCollaborator = async (req, res) => {
  const ToDoId = req.params.id;
  const collaborator = req.body.collaborator;
  console.log(collaborator);
  User.findOne({username:collaborator},(err,userFound)=>{
      if(!err){
        if(userFound){
          console.log(userFound);
          if(userFound.id==req.user.id){
            return res.status(400).send("Todo creater cannot be Todo collaborator");
          }
            ToDo.findById(ToDoId,(error,foundTodo)=>{
              if(!error){
                if(foundTodo){
                  if(foundTodo.createdBy!=req.user.id){
                    return res.status(401).send("You can't add collaborators to this todo");
                  }
                  console.log(userFound.id)
                  if(foundTodo.collab && foundTodo.collab.includes(userFound.id)){
                    return res.status(400).send("Given user is already a collaborator");
                  }
                if(foundTodo.collab){
                  foundTodo.collab.push(userFound.id);
                }else{
                  foundTodo.collab = [userFound.id];
                }
                
                foundTodo.save().then(res.status(200).json({
                  id: foundTodo.id,
                  title: foundTodo.title,
                  createdBy: req.user.id,
                  collaboratorAdded : userFound.username
              })).catch(err=>res.status(500).send(err));
            }else{
              return res.status(404).send("Todo Not Found");
            }
            }else{
              res.status(500).send(error);
            }
            })
        }else{
          return res.status(404).send("User Not Found");
        }
      }else{
        return res.status(500).send(err);
      }
        
  })
}

const removeCollaborator = async (req,res) => {
  const ToDoId = req.params.id;
  const collaborator = req.body.collaborator;
  console.log(collaborator);
  User.findOne({username:collaborator},(err,userFound)=>{
      if(!err){
        if(userFound){
          console.log(userFound);
          if(userFound.id==req.user.id){
            return res.status(400).send("Todo creater was not a Todo collaborator");
          }
            ToDo.findById(ToDoId,(error,foundTodo)=>{
              if(!error){
                if(foundTodo){
                  console.log(userFound.id)
                  if(foundTodo.createdBy!=req.user.id){
                    return res.status(401).send("You can't remove collaborators to this todo");
                  }
                  if(foundTodo.collab && foundTodo.collab.includes(userFound.id)){
                    foundTodo.collab.splice(foundTodo.collab.findIndex((user)=>{user==userFound.id}));
                  }else{
                    return res.status(404).send("No such collaborator");
                  }
                
                foundTodo.save().then(res.status(200).json({
                  id: foundTodo.id,
                  title: foundTodo.title,
                  createdBy: req.user.id,
                  collaboratorRemoved : userFound.username
              })).catch(err=>res.status(500).send(err));
            }else{
              return res.status(404).send("Todo Not Found");
            }
            }else{
              res.status(500).send(error);
            }
            })
        }else{
          return res.status(404).send("User Not Found");
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
