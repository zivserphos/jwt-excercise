const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const morganHandler = require("./middlewares/morgan");
const errorHandler = require("./middlewares/errorHandlers");
const app = express();

const SECRET =
  "d5bf5d20d36046da2c4f6dc16ad03c4143adf399cb4bc1fd25dc03462ac951e946116e632af0a10127900437972c63cf622a1b6401c30e5134c44e2c3f8dc698";

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
app.get("/api/v1/users", (req, res) => {});

app.post("/users/register", async (req, res) => {
  console.log(USERS);
  const { email, name, password } = req.body;
  if (
    USERS.findIndex((user) => {
      user.name === name;
    }) !== -1
  )
    return res.status(409).send("user already exists");
  const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
  USERS.push({
    email: email,
    name: name,
    password: hashPassword,
    isAdmin: false,
  });
  console.log(hashPassword);
  INFORMATION.push({ email: `${email}`, info: `${name} info` });
  res.status(201).send("Register Success");
});

app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((user) => user.email === email);
  if (!user) return res.status(404).send("cannot find user");
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(403).send("User or Password incorrect");
  const token = jwt.sign(user, SECRET, { expiresIn: "10s" });
  const lastToken = jwt.sign(user, SECRET);
  res.status(200).send({
    accessToken: token,
    refreshToken: lastToken,
    email: email,
    name: user.name,
    isAdmin: false,
  });
});

app.post("/users/token");

app.post("/users/tokenValidate");

app.post("/users/logout");

app.use(errorHandler);

app.get("*", function (req, res) {
  res.send("unknown endpoint", 404);
});
module.exports = app;
