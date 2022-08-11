const { Router } = require("express");
const { ToDoController } = require("../controllers");

const middleware = require('../middleware/todo');
const validators = require('../utils/validators');

const router = Router();

router.get("/", ToDoController.getAllToDo);
router.post("/create/", middleware.hasCorrectTitle, ToDoController.createToDo);


router.use('/:id/', validators.hasValidId);
router.get("/:id/", ToDoController.getParticularToDo);
router.put("/:id/", middleware.hasCorrectTitle, ToDoController.editToDo);
router.delete("/:id/", ToDoController.deleteToDo);
router.patch("/:id/", middleware.hasCorrectTitle, ToDoController.editToDoPatch);
router.patch("/:id/add-collaborator/", middleware.hasCollaborator, ToDoController.addCollaborator);
router.patch("/:id/remove-collaborator/", middleware.hasCollaborator, ToDoController.removeCollaborator);

module.exports = router;
