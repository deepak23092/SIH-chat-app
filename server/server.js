const app = require("./src/app");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create an HTTP server for WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// WebSocket logic
require("./src/socket")(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
