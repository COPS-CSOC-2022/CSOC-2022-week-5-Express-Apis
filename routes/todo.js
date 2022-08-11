const { Router } = require("express");
const { ToDoController } = require("../controllers");
const auth = require("../middleware");
const router = Router();
router.use(auth)
router.get("/", ToDoController.getAllToDo);
router.post("/:id/", ToDoController.createToDo);
router.post("/:id/", ToDoController.getParticularToDo);
router.put("/:id/", ToDoController.editToDo);
router.patch("/:id/", ToDoController.editToDoPatch);
router.delete("/:id/", ToDoController.deleteToDo);
router.post("/:id/remove-colab", ToDoController.addColab);
router.post("/:id/add-colab", ToDoController.removeColab);

// TODO: Create the end points similarly
