const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Quote = require("../models/quote");
const user = require("../models/user");
const { default: mongoose } = require("mongoose");

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

  User.findAll({ where: { quoteId: qid } })
    .then((user) => {
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
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  res.status(201).json({
    user: {
      userId: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      token,
    },
  });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.userId;
  let currentUser;

  try {
    currentUser = await User.findById(userId);
  } catch (err) {
    console.log(err.message);
    const error = new HttpError(
      "Failed to delete the user , Please try again later.",
      500
    );

    return next(error);
  }

  if (!currentUser) {
    const error = new HttpError("User not found , Please try again.", 404);
    return next(error);
  }
  const username = currentUser.username;

  if (userId !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this user!",
      403
    );
    return next(error);
  }
  let userQuotes;
  try {
    userQuotes = await Quote.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Failed to delete the user , Please try again later. ",
      500
    );
    console.log(err);
    return next(error);
  }
  if (userQuotes) {
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      for (let i = 0; i < userQuotes.length; i++) {
        await userQuotes[i].remove({ session: sess });
      }
      await currentUser.remove({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        "Failed to delete the user , Please try again later. ",
        500
      );
      console.log(err);
      return next(error);
    }
  }
  /*
  try {
    await currentUser.remove();
  } catch (err) {
    console.log(err.message);
    const error = new HttpError(
      "Failed to delete the user , Please try again later.",
      500
    );

    return next(error);
  }*/
  res.status(200).json({ message: username + "deleted succesfully" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let currentUser;
  let unHashPass;

  try {
    unHashPass = await bcrypt.getSalt(
      "$2a$12$9ZkZXw2yuOa4cTKcUhN0YOiTBXgXmLgtDDNj0Mom18FmHYVZtu0MC"
    );
  } catch (err) {
    console.log(err);
    return next(err);
  }

  try {
    currentUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Failed to log in , please try again", 500);
    console.log(err);
    return next(error);
  }

  if (!currentUser) {
    const error = new HttpError(
      "There is no user with this email , please try again",
      402
    );
    return next(error);
  }

  let isValidPass = false;
  try {
    isValidPass = await bcrypt.compare(password, currentUser.password);
  } catch (err) {
    const error = new HttpError("Failed to log in , please try again", 500);
    console.log(err);
    return next(error);
  }

  if (!isValidPass) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );

    return next(error);
  }
  let token = jwt.sign(
    {
      userId: currentUser.id,
      email: currentUser.email,
      username: currentUser.username,
    },
    process.env.JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.json({
    user: {
      userId: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      token,
    },
  });
};

module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.getQuotesByUserId = getQuotesByUserId;
module.exports.signUp = signUp;
module.exports.deleteUser = deleteUser;
module.exports.login = login;
