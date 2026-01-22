const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const setupSocket = require("./config/socket");

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

connectDB();

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" }
});

setupSocket(io);

server.listen(process.env.PORT, () =>
  console.log("Server running on port", process.env.PORT),
  console.log("server is running at : http://localhost:" + process.env.PORT)
);
