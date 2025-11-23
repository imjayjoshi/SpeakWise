const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const phraseRoutes = require("./routes/phrase.routes");
const practiceHistoryRoutes = require("./routes/practiceHistory.routes");
const adminRoutes = require("./routes/admin.routes");
const cors = require("cors");

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorizartion"],
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/phrase", phraseRoutes);
app.use("/api/practice-history", practiceHistoryRoutes);

module.exports = app;
