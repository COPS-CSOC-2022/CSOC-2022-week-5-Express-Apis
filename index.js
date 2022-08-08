const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

// disable powered by cookies
app.disable("x-powered-by");

const { ToDoRoutes, UserRoutes } = require("./routes");
app.use("/api/auth", UserRoutes);
app.use("/api/todo", ToDoRoutes);


mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// const mongoDB = "mongodb://127.0.0.1/my_database";
// using mongodb atlas for database
const dbURI = require("./config.js").dbURI;
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then((result) => console.log("connected to db"))
.catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, (req,res)=>{
  console.log(`server running on port ${PORT}!`);
});