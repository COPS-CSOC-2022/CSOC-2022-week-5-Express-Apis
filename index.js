const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const checkUser  = require("./middleware/checkUser");

const { ToDoRoutes, UserRoutes } = require("./routes");

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

// disable powered by cookies
app.disable("x-powered-by");


app.use("/api/auth", UserRoutes);
app.use("/api/todo",checkUser,ToDoRoutes);

const PORT = process.env.PORT || 8000;
const mongoDB = "mongodb://localhost:27017/Week5";

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongoose connected")
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}/`);
    });
  })
  .catch((err) => console.log(err.message));
