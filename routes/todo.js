const { Router } = require("express");
const { ToDoController } = require("../controllers");
const router = Router();

router.get("/", ToDoController.getAllToDo);
router.post("/:id/", ToDoController.createToDo);

// TODO: Create the end points similarly
