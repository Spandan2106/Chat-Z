const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running successfully");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/chats", require("./routes/chat.routes"));
app.use("/api/messages", require("./routes/message.routes"));
// Add this line inside app.js
app.use("/users", require("./routes/user.routes"));


module.exports = app;
