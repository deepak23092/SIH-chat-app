const express = require("express");
const { openAiFunc } = require("../controllers/openAIController");

const router = express.Router();

router.post("/generate-action", openAiFunc);

module.exports = router;
