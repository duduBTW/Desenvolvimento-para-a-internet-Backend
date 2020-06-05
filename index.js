const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require("cors");

dotenv.config();

//Import route
const authRoute = require("./routes/auth");
const animeRoute = require("./routes/anime");

//Connect to DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("conectado")
);

//Middlewares
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Route Middlewares
app.use(cors());
app.use("/api/user", authRoute);
app.use("/api/anime", animeRoute);

app.listen(3001, () => console.log("Server Up and running"));
