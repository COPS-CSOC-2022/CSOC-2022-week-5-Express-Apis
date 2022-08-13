const { Router } = require("express");
const { ToDoController } = require("../controllers");
const router = Router();
const middlewareObj = require("../middleware/token_auth");

// TODO: Create the end points similarly
router.get("/", middlewareObj.isAuthorized, ToDoController.getAllToDo);
router.post("/create", middlewareObj.isAuthorized, ToDoController.createToDo);
router.get(
  "/:id",
  middlewareObj.isAuthorized,
  ToDoController.getParticularToDo
);
router.put(
  "/:id",
  middlewareObj.isAuthorized,
  middlewareObj.titleValidator,
  ToDoController.editToDo
);
router.patch(
  "/:id",
  middlewareObj.isAuthorized,
  middlewareObj.titleValidator,
  ToDoController.editToDoPatch
);
router.delete("/:id", middlewareObj.isAuthorized, ToDoController.deleteToDo);
router.put(
  "/:id/add-collaborator/",
  middlewareObj.isAuthorized,
  middlewareObj.collabValidator,
  ToDoController.addCollaborator
);
router.put(
  "/:id/remove-collaborator/",
  middlewareObj.isAuthorized,
  middlewareObj.collabValidator,
  ToDoController.removeCollaborator
);

module.exports = router;
