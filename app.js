const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const morganHandler = require("./middlewares/morgan");
const errorHandler = require("./middlewares/errorHandlers");
const app = express();

const USERS = [];
const INFORMATION = [];
const REFRESHTOKENS = [];

app.use(express.json());
app.use(
  morganHandler,
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (req, res) => {
  res.send("fuck off");
});

app.get("/api/v1/information");
app.get("/api/v1/users");

app.post("/users/register", async (req, res) => {
  const { email, user, password } = req.body;
  if (
    USERS.findIndex((user) => {
      user.name === user;
    }) !== -1
  )
    return res.status(409).send("user already exists");
  const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
  USERS.push({
    email: email,
    name: user,
    password: hashPassword,
    isAdmin: false,
  });
  console.log(hashPassword);
  INFORMATION.push({ email: `${email}`, info: `${user} info` });
  res.status(201).send("Register Success");
});

app.post("/users/login");

app.post("/users/token");

app.post("/users/tokenValidate");

app.post("/users/logout");

app.use(errorHandler);

app.get("*", function (req, res) {
  res.send("unknown endpoint", 404);
});
module.exports = app;
