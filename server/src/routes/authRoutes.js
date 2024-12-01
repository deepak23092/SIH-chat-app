const express = require("express");
const {
  register,
  login,
  getUserList,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users/:userId", getUserList); // New route to get the user list

module.exports = router;
