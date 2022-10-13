const express = require("express");

const router = express.Router();
const usersControllers = require("../controllers/users-controllers");

router.get("/", usersControllers.getUsers);
router.get("/:uid", usersControllers.getUserById);
router.get("/:uid/quotes", usersControllers.getQuotesByUserId);
router.post("/sign-up", usersControllers.signUp);
router.post("/login", usersControllers.login);

module.exports = router;
