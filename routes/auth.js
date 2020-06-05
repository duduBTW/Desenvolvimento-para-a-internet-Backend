const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
var WebTorrent = require("webtorrent");
var fs = require("fs");

const verify = require("./verifyToken");

//Validation
const { registerValidation, loginValidation } = require("../validation/user");

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    //VALIDATION
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await User.findOne({ email: req.body.email });

    if (emailExist) return res.status(400).send("Email alredy exists");

    //HASH password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  //VALIDATION
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email is wrong");

  //VALIDATE THE PASSWORD
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is wrong");

  const token = jwt.sign(
    { _id: user._id, email: user.email, userName: user.name },
    process.env.TOKEN_SECRET
  );
  res.header("auth-token", token).send({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    token: token,
  });
});

router.get("/profile", verify, async (req, res) => {
  console.log("-_--------------------");
  console.log(req.user._id);

  User.find({ _id: req.user._id }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    //data.password = "nepSmug";

    return res.json({
      success: true,
      user: data,
    });
  });
});

module.exports = router;
