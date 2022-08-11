const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const middleware = require('./middleware/todo');
const { ToDoRoutes, UserRoutes } = require("./routes");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.disable("x-powered-by");                             // disable powered by cookies

app.use("/api/auth", UserRoutes);
app.use("/api/todo", middleware.isAuthorized, ToDoRoutes);
app.use("*", function (req, res) {
  return res.status(404).json({
    error: "The endpoint you are requesting does not exist. "
  })
});

const PORT = process.env.PORT || 8000;

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT} \nDatabase connected`));
  })
  .catch((err) => console.log(err.message));
