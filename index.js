const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const { ToDoRoutes, UserRoutes } = require("./routes");

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.disable("x-powered-by");

app.use("/api/auth", UserRoutes);
app.use("/api/todo", ToDoRoutes);

const dbURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Db conncected Successfully!");
    app.listen(PORT, (req, res) => {
      console.log(`Server running on port ${PORT}! `);
    });
  })
  .catch((err) => console.log(err));
