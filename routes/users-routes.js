const express = require("express");

const router = express.Router();
const usersControllers = require("../controllers/users-controllers");
const checkAuth = require("../middleware/check-auth");

router.get("/", usersControllers.getUsers);
router.post("/sign-up", usersControllers.signUp);
router.post("/login", usersControllers.login);
router.use(checkAuth);
router.get("/:uid", usersControllers.getUserById);
router.get("/:uid/quotes", usersControllers.getQuotesByUserId);
router.delete("/:userId/delete", usersControllers.deleteUser);

module.exports = router;
