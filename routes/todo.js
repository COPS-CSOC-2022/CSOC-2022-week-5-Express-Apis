const { Router } = require("express");
const { ToDoController } = require("../controllers");
const middlewareObj = require("../middleware/token_auth");
const router = Router();



// TODO: Create the end points similarly
router
  .route("/")
  .get(ToDoController.getAllToDo)
  .post(ToDoController.createToDo);
router
  .route("/:id")
  .get(ToDoController.getParticularToDo)
  .put(ToDoController.editToDo)
  .patch(ToDoController.editToDo)
  .delete(ToDoController.deleteToDo);
router
  .route("/:id/add-collaborators/")
  .post(ToDoController.addCollaborator);
router
  .route("/:id/remove-collaborators")
  .post(ToDoController.removeCollaborator);

module.exports = router;
