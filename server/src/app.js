const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const connectDB = require("./config/db");
const conversation = require("./routes/conversation");
const openAi = require("./routes/openai");

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/conversation", conversation);
app.use("/api/openai", openAi);

module.exports = app;
