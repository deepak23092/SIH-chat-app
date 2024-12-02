const express = require("express");
const { getMessages } = require("../controllers/chatController");
const router = express.Router();

router.post("/send");
router.get("/:userId/:chatPartnerId", getMessages);

module.exports = router;
