const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const { ToDoRoutes, UserRoutes } = require("./routes");
const middlewareObj = require("./middleware/token_auth");

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

// disable powered by cookies
app.disable("x-powered-by");
app.use("/",(err,_req,res,next)=>{
  try{
      if (err) {
      if (err.statusCode){
        res.status(err.statusCode).json({
          type: err.type,
        });
      } else {
        res.sendStatus(400);
      }
    } else {
      next();
    }
  } catch(_) {
    res.sendStatus(500);
  }
});
app.use("/api/auth", UserRoutes);
app.use("/api/todo", middlewareObj.isLoggedIn,ToDoRoutes);


const PORT = process.env.PORT || 8000;
const mongoDB = "mongodb://127.0.0.1/my_database";

mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err.message));
