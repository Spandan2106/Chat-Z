const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running successfully");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/chats", require("./routes/chat.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/status", require("./routes/status.routes"));
app.use("/api/settings", require("./routes/settings.routes"));

// Add this line to serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ... rest of your server setup ...
module.exports = app;
