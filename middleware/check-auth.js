const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new Error("Authorization Failed!");
    }

    const decodedToken = jwt.verify(token, "s3cret");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Authorization Failed!", 401);
    return next(error);
  }
};
