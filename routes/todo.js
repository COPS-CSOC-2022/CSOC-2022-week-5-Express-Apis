const { Router } = require("express");
const { ToDoController } = require("../controllers");
// const getUser = require('../middleware/getUser')
const router = Router();

router.get("/",ToDoController.getAllToDo);
router.post("/", ToDoController.createToDo);
router.get("/:id",ToDoController.getParticularToDo);
router.put("/:id",ToDoController.editToDo);
router.patch("/:id",ToDoController.editToDoPatch);
router.delete("/:id",ToDoController.deleteToDo);
router.delete("/:id/remove-collaborators/",ToDoController.removeCollaborator);
router.post("/:id/add-collaborators/",ToDoController.addCollaborator);

// TODO: Create the end points similarly
module.exports = router;
