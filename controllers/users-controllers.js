const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Quote = require("../models/quote");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not get all users",
      500
    );
    return next(error);
  }

  res.json({
    users: users.map((user) => {
      return user.toObject({ getters: true });
    }),
  });
};

const getUserById = (req, res, next) => {
  const qid = req.params.quoteId;
  console.log("Hello");
  User.findAll({ where: { quoteId: qid } })
    .then((user) => {
      console.log(user);
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
    });
};
const getQuotesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let currentUser;
  let userQuotes;
  console.log("###");

  console.log(req.params);
  console.log("###");

  try {
    userQuotes = await Quote.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching user's quotes failed ! Please try again ",
      500
    );
    console.log(err);
    return next(error);
  }
  console.log(userQuotes);
  if (!userQuotes) {
    const error = new HttpError(
      "Can't found user with this ID  ! Please try again ",
      404
    );

    return next(error);
  }

  res.json({ userQuotes });
};
const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;

  let existingUser;
  let createdUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Sign up failed! ,Please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already! please login instead",
      422
    );
    return next(error);
  }
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Sign up failed! ,Please try again", 500);

    return next(error);
  }

  createdUser = new User({ username, email, password: hashedPassword });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Sign up failed! ,Please try again", 500);
    return next(error);
  }

  const token = jwt.sign(
    { userId: createdUser.id, email: createdUser.email },
    "s3cret",
    { expiresIn: "1h" }
  );

  res.status(201).json({
    user: { userId: createdUser.id, email: createdUser.email, token },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let currentUser;
  try {
    currentUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Failed to log in , please try again", 500);
    return next(error);
  }

  if (!currentUser) {
    const error = new HttpError(
      "There is no user with this email , please try again",
      402
    );
    return next(error);
  }

  let token = jwt.sign(
    {
      userId: currentUser.id,
      email: currentUser.email,
      username: currentUser.username,
    },
    "s3cret",
    {
      expiresIn: "1h",
    }
  );

  res.json({
    user: { userId: currentUser.id, username: currentUser.username, token },
  });
};

module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.getQuotesByUserId = getQuotesByUserId;
module.exports.signUp = signUp;
module.exports.login = login;
