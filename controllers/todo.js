const ToDo = require("../models/todo");
const User = require("../models/user");

const getAllToDo = async (req, res) => {
  ToDo.find({
    $or: [
      { createdBy: req.user._id },
      { collaborators: req.user._id }
    ]
  })
    .populate('createdBy', '_id')
    .populate('collaborators')
    .then((todos) => {
      let createdTodos = todos.filter(todo => todo.createdBy._id.equals(req.user._id));
      let collabTodos = todos.filter(todo => !todo.createdBy._id.equals(req.user._id));

      res.status(200).json({
        createdTodos: createdTodos.map(todo => ({
          id: todo._id,
          title: todo.title
        })),

        collabTodos: collabTodos.map(todo => ({
          id: todo.id,
          title: todo.title,
          createdBy: todo.collaborators.find(creator => creator._id == todo.createdBy._id).username
        }))
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: "Something went wrong with your request.\n" + err.message
      });
    })
};

const createToDo = async (req, res) => {
  const todo = new ToDo({
    title: req.body.title,
    createdBy: req.user._id,
    collaborators: []
  });

  todo.save()
    .then(todo => res.status(200).json({
      id: todo.id,
      title: todo.title
    }))
    .catch(err => {
      res.status(500).json({
        error: "Something went wrong with your reuest.\n" + err.message
      });
    });
};

const getParticularToDo = async (req, res) => {
  ToDo.findById(req.params.id)
    .populate('collaborators', '_id username')
    .then((todo) => {

      if (todo == null) {
        return res.status(404).json({
          error: 'No such todo exists in the database.'
        });
      }

      var creator = null;
      if (todo.createdBy.equals(req.user.id)) creator = req.user.username;
      else {
        todo.collaborators.forEach((user) => {
          if (user._id.equals(todo.createdBy)) creator = user.username;
        })
        if (creator === null) {
          return res.status(403).json({
            error: "You do not have access to view the details of this todo"
          });
        }
      }

      res.status(200).json({
        id: todo.id,
        title: todo.title,
        createdBy: creator,
        collaborators: todo.collaborators.map(user => user.username)
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: 'Something went wrong with your request.\n' + err.message
      });
    })
};

const editToDo = async (req, res) => {
  ToDo.findById(req.params.id, (err, todo) => {
    if (err) {
      return res.status(500).json({
        error: "Something went wrong with your request.\n" + err.message
      });
    }

    if (todo == null) {
      return res.status(404).json({
        error: "No Todo exists with the given ID."
      });
    }

    if (!todo.createdBy.equals(req.user.id) && !todo.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        error: "You do have the access to this Todo."
      });
    }

    todo.title = req.body.title;
    todo.save()
      .then(todo => res.status(200).json({
        id: todo.id,
        title: todo.title,
        collaborators: todo.collaborators
      }))
      .catch(err => {
        return res.status(500).json({
          error: "Something went wrong with your request.\n" + err.message
        })
      });
  });
};

const editToDoPatch = async (req, res) => {
  editToDo(req, res);
};

const deleteToDo = async (req, res) => {
  ToDo.findById(req.params.id, (err, todo) => {
    if (err) {
      return res.status(500).json({
        error: "Something went wrong with your request.\n" + err.message
      });
    }

    if (todo == null) {
      return res.status(404).json({
        error: "No Todo exists with the given ID."
      });
    }

    if (!todo.createdBy.equals(req.user.id) && !todo.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        error: "You do have the access to this Todo."
      });
    }

    todo.remove((err, _) => {
      if (err) {
        return res.status(500).json({
          error: "Something went wrong with your request.\n" + err.message
        });
      }
      return res.status(204).json({
        message: "Todo deleted successfully."
      });
    })
  })
};

const addCollaborator = async (req, res) => {
  ToDo.findById(req.params.id, (err, todo) => {

    if (err) return res.status(500).json({
      error: 'Something went wrong with your request.\n' + err.message
    });

    if (todo == null) return res.status(404).json({
      error: 'The given todo does not exist in the database.'
    });

    if (!todo.createdBy.equals(req.user._id)) return res.status(403).json({
      error: 'You do not have priviliges to perform this operation.'
    });

    User.findOne({ username: req.body.collaborator }, (err, collab) => {
      if (err) return res.status(500).json({
        error: 'Something went wrong with your request.\n' + err.message
      });

      if (collab === null) return res.status(404).json({
        error: 'The given user does not exist in the database.'
      });

      if (collab._id.equals(req.user._id)) return res.status(422).json({
        error: "Creator of the todo cannot be added as collaborator"
      });


      if (todo.collaborators && todo.collaborators.includes(collab._id)) return res.status(409).json({
        error: "User has already been added as a collaborator"
      });

      if (todo.collaborators) todo.collaborators.push(collab._id);
      else todo.collaborators = [collab._id];

      todo.save()
        .then(_ => res.status(200).json({
          message: "Collaborator added successfully."
        }))
        .catch(err => res.status(500).json({
          error: "Something went wrong with your request.\n" + err.message
        }));
    });
  });
}

const removeCollaborator = async (req, res) => {
  ToDo.findById(req.params.id, (err, todo) => {

    if (err) return res.status(500).json({
      error: 'Something went wrong with your request.\n' + err.message
    });

    if (todo == null) return res.status(404).json({
      error: 'The given todo does not exist in the database.'
    });

    if (!todo.createdBy.equals(req.user._id)) return res.status(403).json({
      error: 'You do not have priviliges to perform this operation.'
    });

    User.findOne({ username: req.body.collaborator }, (err, collab) => {
      if (err) return res.status(500).json({
        error: 'Something went wrong with your request.\n' + err.message
      });

      if (collab === null) return res.status(404).json({
        error: 'The given user does not exist in the database.'
      });

      if (!todo.collaborators || !todo.collaborators.includes(collab._id)) return res.status(409).json({
        error: "User is not a collaborator for this todo."
      });

      todo.collaborators.splice(todo.collaborators.indexOf(collab._id), 1);

      todo.save()
        .then(_ => res.status(200).json({
          message: "Collaborator removed successfully."
        }))
        .catch(err => res.status(500).json({
          error: "Something went wrong with your request.\n" + err.message
        }));
    });
  });
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
