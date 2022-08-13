const ToDo = require("../models/todo.js");
const User = require("../models/user.js");
const paramsChecker = require("mongoose").Types.ObjectId.isValid;
// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
  ToDo.find({
    $or: [{ createdBy: req.user._id }, { collaborators: req.user._id }],
  })
    .populate("createdBy", "_id")
    .populate("collaborators")
    .then((todos) => {
      let personalTodos = todos.filter((todo) =>
        todo.createdBy._id.equals(req.user._id)
      );
      let collaboratedTodos = todos.filter(
        (todo) => !todo.createdBy._id.equals(req.user._id)
      );

      res.status(200).json({
        personalTodos: personalTodos.map((todo) => ({
          id: todo._id,
          title: todo.title,
        })),

        collaboratedTodos: collaboratedTodos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          createdBy: todo.collaborators.find(
            (creator) => creator._id == todo.createdBy._id
          ).username,
        })),
      });
    })
    .catch((err) => {
      res.status(500).json({ error: `Internal Server Error ${err.message}` });
    });
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly

  const todo = new ToDo({
    title: req.body.title,
    createdBy: req.user._id,
    collaborators: [],
  });

  await todo
    .save()
    .then(
      res.status(200).json({
        id: todo._id,
        title: todo.title,
        createdBy: req.user.username,
      })
    )

    .catch((err) => {
      if (err)
        res.status(500).json({
          error: `Internal Server Error ${err.message}`,
        });
    });
};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.

  if (paramsChecker(req.params.id)) {
    ToDo.findById(req.params.id)
      .populate("collaborators", "_id username")
      .then((todo) => {
        if (todo == null) {
          return res.status(404).json({
            error: "No such todo exists in the database.",
          });
        }

        var creator = null;
        if (todo.createdBy.equals(req.user.id)) creator = req.user.username;
        else {
          todo.collaborators.forEach((user) => {
            if (user._id.equals(todo.createdBy)) creator = user.username;
          });
          if (creator === null) {
            return res.status(403).json({
              error: "You do not have access to view the details of this todo",
            });
          }
        }

        res.status(200).json({
          id: todo.id,
          title: todo.title,
          createdBy: creator,
          collaborators: todo.collaborators.map((user) => user.username),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: "Something went wrong with your request.\n" + err.message,
        });
      });
  }
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
  if (paramsChecker(req.params.id)) {
    ToDo.findById(req.params.id, (err, todo) => {
      if (todo) {
        console.log(todo);
        if (todo.createdBy != req.user.id) {
          return res.status(401).send("User Unauthorized to Edit this Todo");
        } else {
          todo.title = title;
          todo.save().then(
            res.status(200).json({
              title: todo.title,
              createdBy: req.user.username,
              collaborators: todo.collaborator,
            })
          );
        }
      } else {
        return res.status(404).send("Todo Not Found");
      }
    });
  } else {
    return res
      .status(500)
      .json({ error: `Internal Server Error ${err.message}` });
  }
};

const editToDoPatch = async (req, res) => {
  editToDo(req, res);
};

const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
  const ToDoId = req.params.id;

  ToDo.findById(ToDoId, (err, todo) => {
    if (err) {
      return res
        .status(500)
        .json({ error: `Internal Server Error ${err.message}` });
    }

    if (!todo) {
      return res.status(404).json({
        error: "No ToDo found with given ID!",
      });
    }

    if (
      todo.createdBy != req.user.id &&
      !todo.collaborators.includes(req.user.id)
    ) {
      return res.status(401).send("Not authorized to delete this todo");
    } else {
      ToDo.findByIdAndDelete(ToDoId, (err, todo) => {
        if (err) {
          res
            .status(500)
            .json({ error: `Internal Server Error ${err.message}` });
        } else {
          res.status(200).json({ message: "Todo Deleted Successfully" });
        }
      });
    }
  });
};

const addCollaborator = async (req, res) => {
  const ToDoId = req.params.id;
  const collaborator = req.body.collaborator;

  ToDo.findById(ToDoId, (err, todo) => {
    if (err) {
      return res
        .status(500)
        .json({ error: `Internal Server Error ${err.message}` });
    }

    if (!todo) {
      return res.status(404).json({ error: "Todo with given ID not found" });
    }

    if (!todo.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Only creator of this ToDo can add collaborator" });
    }

    User.findOne({ username: collaborator }, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ error: `Internal Server Error ${err.message}` });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user._id.equals(req.user._id)) {
        return res
          .status(400)
          .json({ error: "Creator of todo cannot be added as collaborator" });
      }

      if (todo.collaborators.length > 0) {
        if (todo.collaborators.includes(user._id)) {
          return res
            .status(400)
            .json({ error: "User already a collaborator for the given todo" });
        }
      }
      if (todo.collaborators) {
        todo.collaborators.push(user._id);
      } else {
        todo.collaborators = [user._id];
      }
      todo
        .save()
        .then(
          res.status(200).json({
            message: "Collaborator added successfully",
            id: todo.id,
            title: todo.title,
            createdBy: req.user.id,
            collaboratorAdded: userFound.username,
          })
        )
        .catch((err) =>
          res
            .status(500)
            .json({ error: `Internal Server Error: ${err.message}` })
        );
    });
  });
};

const removeCollaborator = async (req, res) => {
  const ToDoId = req.params.id;
  const collaborator = req.body.collaborator;

  ToDo.findById(ToDoId, (err, todo) => {
    if (err) {
      return res
        .status(500)
        .json({ error: `Internal Server Error ${err.message}` });
    }

    if (!todo) {
      return res.status(404).json({ error: "Todo with given ID not found" });
    }

    if (!todo.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Only creator of this ToDo can remove collaborator" });
    }

    User.findOne({ username: collaborator }, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ error: `Internal Server Error ${err.message}` });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (todo.collaborators.length == 0) {
        return res
          .status(400)
          .json({ error: "No collaboratorsfound for this todo!" });
      }

      if (todo.collaborators.length > 0) {
        if (!todo.collaborators.includes(user._id)) {
          return res
            .status(400)
            .json({ error: "User is not a collaborator for the given todo" });
        }
      }
      todo.collaborators.splice(
        todo.collaborators.findIndex((collab) => {
          collab == user._id;
        })
      );
      todo
        .save()
        .then(
          res.status(200).json({
            message: "Collaborator added successfully",
            id: todo.id,
            title: todo.title,
            createdBy: req.user.id,
            collaboratorRemoved: user.username,
          })
        )
        .catch((err) =>
          res
            .status(500)
            .json({ error: `Internal Server Error: ${err.message}` })
        );
    });
  });
};

module.exports = {
  createToDo,
  deleteToDo,
  editToDo,
  editToDoPatch,
  getAllToDo,
  getParticularToDo,
  addCollaborator,
  removeCollaborator,
};
