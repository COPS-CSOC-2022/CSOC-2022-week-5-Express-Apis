const { Router } = require("express");
const { ToDoController } = require("../controllers");
// const getUser = require('../middleware/getUser')
const router = Router();

router.get("/",ToDoController.getAllToDo);
router.get("/:id",ToDoController.getParticularToDo);
router.put("/:id",ToDoController.editToDo);
router.patch("/:id",ToDoController.editToDoPatch);
router.delete("/:id",ToDoController.deleteToDo);
router.post("/addCollaborator/:id",ToDoController.addCollaborator);
router.post("/", ToDoController.createToDo);

// TODO: Create the end points similarly
module.exports = router;