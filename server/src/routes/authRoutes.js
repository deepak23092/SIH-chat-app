const express = require("express");
const {
  register,
  login,
  getUserList,
  getUser,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users/:userId", getUserList);
router.get("/getUser/:userId", getUser);

module.exports = router;
