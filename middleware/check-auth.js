const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
 
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    token;
    if (!token) {
      throw new Error("Authorization Failed!");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    req.userData;
    next();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Authorization Failed!", 401);
    return next(error);
  }
};
