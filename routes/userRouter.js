const router = require("express").Router();
const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register
router.post("/", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    if (!email || !password || !passwordVerify)
      return res
        .status(400)
        .json({ errorMessage: "Please enter the required fields" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ errorMessage: "Password must be at least 6 character" });
    if (password !== passwordVerify)
      return res.status(400).json({ errorMessage: "Password doesn't match" });

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res.status(400).json({ errorMessage: "Email already exists" });

    //hash the pass

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // save the new User

    const newUser = new User({
      email,
      passwordHash,
    });
    const savedUser = await newUser.save();
    //sign the token

    const token = jwt.sign(
      {
        user: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    //send token in a HTTP-only cookie

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //validate
  if (!email || !password)
    return res
      .status(400)
      .json({ errorMessage: "Please enter the required fields" });

  const existingUser = await User.findOne({ email: email });
  if (!existingUser)
    return res.status(401).json({ errorMessage: "Wrong Email or password" });

  const passwordCorrect = await bcrypt.compare(
    password,
    existingUser.passwordHash
  );
  if (!passwordCorrect)
    return res.status(401).json({ errorMessage: "Wrong Email or password" });

  //sign the token

  const token = jwt.sign(
    {
      user: existingUser._id,
    },
    process.env.JWT_SECRET
  );

  //send token in a HTTP-only cookie

  res
    .cookie("token", token, {
      httpOnly: true,
    })
    .send();
});

//logout

router.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(200).json(false);
    verified = jwt.verify(token, process.env.JWT_SECRET);
    res.send(true);
  } catch (err) {
    console.log(err);
    res.status(200).json(false);
  }
});

module.exports = router;
