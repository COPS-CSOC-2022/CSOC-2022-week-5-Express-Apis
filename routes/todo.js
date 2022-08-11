const { Router } = require("express");
const { ToDoController , UserController, middlewareObject} = require("../controllers");
const router = Router();

router.route("/")
    .get( middlewareObject.isLoggedIn, ToDoController.getAllToDo)
    
router.route("/create/")
    .post(middlewareObject.isLoggedIn, ToDoController.createToDo);

router.route("/:id/")
    .get(middlewareObject.isLoggedIn, ToDoController.getParticularToDo)
    .put(middlewareObject.isLoggedIn, ToDoController.editToDo)
    .patch(middlewareObject.isLoggedIn, ToDoController.editToDoPatch)
    .delete(middlewareObject.isLoggedIn, ToDoController.deleteToDo);

router.route("/:id/add-collaborators/")
    .post(middlewareObject.isLoggedIn, ToDoController.addCollaborator);

router.route("/:id/remove-collaborators/")
    .post(middlewareObject.isLoggedIn, ToDoController.removeCollaborator);
// TODO: Create the end points similarly

module.exports = router;