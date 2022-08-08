const { Router } = require("express");
const { ToDoController } = require("../controllers");
const router = Router();
const userAuth = require("../middleware/auth.js");

// TODO: Create the end points similarly
router.get("/", userAuth, ToDoController.getAllToDo);
router.post("/create", userAuth, ToDoController.createToDo);
router.get("/:id", userAuth, ToDoController.getParticularToDo);
router.put("/:id", userAuth, ToDoController.editToDo);
router.patch("/:id", userAuth, ToDoController.editToDoPatch);
router.delete("/:id", userAuth, ToDoController.deleteToDo);
router.put("/:id/add-collaborators/", userAuth, ToDoController.addCollaborators);
router.put("/:id/remove-collaborators/", userAuth, ToDoController.removeCollaborators);

module.exports = router;