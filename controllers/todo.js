const { ToDo, Token } = require("../models");

// All the given method require token.
// So be sure to check for it before doing any stuff
// HINT: Create a middleware for above :)

const getAllToDo = async (req, res) => {
  // Get the token in header.
  // Use the token to get all the ToDo's of a user
};

const createToDo = async (req, res) => {
  // Check for the token and create a todo
  // or throw error correspondingly
};

const getParticularToDo = async (req, res) => {
  // Get the Todo of the logged in user with given id.
};

const editToDo = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response.
};

const editToDoPatch = async (req, res) => {
  // Change the title of the Todo with given id, and get the new title as response
};

const deleteToDo = async (req, res) => {
  //  Delete the todo with given id
};

module.exports = {
  createToDo,
  deleteToDo,
  editToDo,
  editToDoPatch,
  getAllToDo,
  getParticularToDo,
};
