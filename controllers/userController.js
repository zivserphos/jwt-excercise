const bcrypt = require("bcrypt");
const USERS = require("USER");

exports.register = async (req, res) => {
  const registerData = req.body;
  res.status(201).send("Register Success");
};
