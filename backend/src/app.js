const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/chats", require("./routes/chat.routes"));
app.use("/api/messages", require("./routes/message.routes"));

module.exports = app;
