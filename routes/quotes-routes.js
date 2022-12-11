const express = require("express");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();
const quotesControllers = require("../controllers/quotes-controllers");

router.get("/", quotesControllers.getQuotes);
router.get("/:qid", quotesControllers.getQuoteById);
router.use(checkAuth);
router.post("/add-quote", quotesControllers.addQuote);
router.patch("/:qid", quotesControllers.editQuote);

router.delete("/:quoteId/delete-quote", quotesControllers.deleteQuote);

module.exports = router;
