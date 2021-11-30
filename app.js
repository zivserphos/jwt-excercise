const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const morganHandler = require("./middlewares/morgan");
const errorHandler = require("./middlewares/errorHandlers");
const app = express();

const SECRET =
  "d5bf5d20d36046da2c4f6dc16ad03c4143adf399cb4bc1fd25dc03462ac951e946116e632af0a10127900437972c63cf622a1b6401c30e5134c44e2c3f8dc698";

const USERS = [
  {
    name: "admin",
    email: "admin@email.com",
    password: "$2b$10$BYOHlZ1OyUXaGibdL0fVSOU.Zug0mueqJk6DCxewq8ZFnrgRYHbCC",
    isAdmin: true,
  },
];
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

app.get("/api/v1/information", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).send("Access Token Required");
  jwt.verify(token, SECRET, (failure, user) => {
    if (user) {
      const { email } = user;
      const info = INFORMATION.find((obj) => obj.email === email).info;
      return res.status(200).send([{ email }, { info }]);
    }
    return res.status(403).send("Invalid Access Token");
  });
});
app.get("/api/v1/users", (req, res) => {});

app.post("/users/register", async (req, res) => {
  const { email, name, password } = req.body;
  if (USERS.find((user) => user.name === name)) {
    return res.status(409).send("user already exists");
  }
  const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
  USERS.push({
    email: email,
    name: name,
    password: hashPassword,
    isAdmin: false,
  });
  INFORMATION.push({ email: `${email}`, info: `${name} info` });
  res.status(201).send("Register Success");
});

app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((user) => user.email === email);
  if (!user) {
    return res.status(404).send("cannot find user");
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(403).send("User or Password incorrect");
  }
  const token = jwt.sign(user, SECRET, { expiresIn: "10s" });
  const lastToken = jwt.sign(user, SECRET);
  REFRESHTOKENS.push(lastToken);
  return res.status(200).send({
    accessToken: token,
    refreshToken: lastToken,
    email: email,
    name: user.name,
    isAdmin: user.isAdmin,
  });
});

app.post("/users/token", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).send("Refresh Token Required");
  jwt.verify(token, SECRET, (failure, user) => {
    if (user) {
      const accessToken = jwt.sign(user, SECRET);
      return res.status(200).send({ accessToken });
    }
    return res.status(403).send("Invalid Refresh Token");
  });
});

app.post("/users/tokenValidate");

app.post("/users/logout", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.status(400).send("Refresh Token Required");
  const tokenIndex = REFRESHTOKENS.find((token) => token === refreshToken);
  !tokenIndex
    ? res.status(400).send("Invalid Refresh Token")
    : REFRESHTOKENS.splice(tokenIndex, 1);
  res.status(200).send("User Logged Out Successfully");
});

app.options("/", (req, res) => {
  res.setHeader("Allow", "OPTIONS, GET, POST");
  res.status(200).send([
    {
      method: "post",
      path: "/users/register",
      description: "Register, Required: email, name, password",
      example: {
        body: { email: "user@email.com", name: "user", password: "password" },
      },
    },
    {
      method: "post",
      path: "/users/login",
      description: "Login, Required: valid email and password",
      example: { body: { email: "user@email.com", password: "password" } },
    },
    {
      method: "post",
      path: "/users/token",
      description: "Renew access token, Required: valid refresh token",
      example: { headers: { token: "*Refresh Token*" } },
    },
    {
      method: "post",
      path: "/users/tokenValidate",
      description: "Access Token Validation, Required: valid access token",
      example: { headers: { Authorization: "Bearer *Access Token*" } },
    },
    {
      method: "get",
      path: "/api/v1/information",
      description: "Access user's information, Required: valid access token",
      example: { headers: { Authorization: "Bearer *Access Token*" } },
    },
    {
      method: "post",
      path: "/users/logout",
      description: "Logout, Required: access token",
      example: { body: { token: "*Refresh Token*" } },
    },
    {
      method: "get",
      path: "api/v1/users",
      description: "Get users DB, Required: Valid access token of admin user",
      example: { headers: { authorization: "Bearer *Access Token*" } },
    },
  ]);
});

app.use(errorHandler);

app.use("*", function (req, res) {
  res.send("unknown endpoint", 404);
});
module.exports = app;
