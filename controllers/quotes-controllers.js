const HttpError = require("../models/http-error");
const Quote = require("../models/quote");
const mongoose = require("mongoose");
const User = require("../models/user");

const getQuotes = async (req, res, next) => {
  let allQuotes;

  try {
    allQuotes = await Quote.find();
  } catch (err) {
    console.log(err.message);
    const error = new HttpError(
      "Something went wrong, could not get all quotes!",
      500
    );
    return next(error);
  }

  res.json({
    quotes: allQuotes.map((quote) => {
      return quote.toObject({ getters: true });
    }),
  });
};

const getQuoteById = async (req, res, next) => {
  const quoteId = req.params.qid;
  let quote;

  try {
    quote = await Quote.findById(quoteId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not get your quote.",
      500
    );
    return next(error);
  }

  if (!quote) {
    const error = new HttpError("Could not find quote to provided id.", 404);
    return next(error);
  }
  res.json({ quote });
};

const deleteQuote = async (req, res, next) => {
  if (req.headers === "OPTIONS") return next();
  const quoteId = req.params.quoteId;

  let currentQuote;
  try {
    console.log(quoteId);
    currentQuote = await Quote.findById(quoteId).populate("creator");
    console.log(currentQuote);
  } catch (err) {
    const error = new HttpError(
      "Could not delete your quote, please try again later.",
      500
    );
    return next(error);
  }
  if (!currentQuote) {
    const error = new HttpError("Could not find a quote with this ID.", 404);
    return next(error);
  }

  if (currentQuote.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this quote!",
      403
    );
    return next(error);
  }

  try {
    await currentQuote.remove();
  } catch (err) {
    const error = new HttpError(
      "Could not delete your quote, please try again later.",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Deleted quote." });
};
const addQuote = async (req, res, next) => {
  const { author, content } = req.body;

  let createdQuote;
  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating quote failed! Please try again ");
    console.log(err);
    return next(error);
  }
  createdQuote = new Quote({
    author,
    content,
    creator: req.userData.userId,
    creatorName: user.username,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdQuote.save({ session: sess });
    user.quotes.push(createdQuote);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating quote failed! Please try again ");
    console.log(err);
    return next(error);
  }

  res.status(201).json({ quote: createdQuote });
};

module.exports.getQuotes = getQuotes;
module.exports.getQuoteById = getQuoteById;
module.exports.addQuote = addQuote;
module.exports.deleteQuote = deleteQuote;
