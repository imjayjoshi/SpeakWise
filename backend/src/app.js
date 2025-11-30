const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const authRoutes = require("./routes/auth.routes");
const phraseRoutes = require("./routes/phrase.routes");
const practiceHistoryRoutes = require("./routes/practiceHistory.routes");
const adminRoutes = require("./routes/admin.routes");
const healthRoutes = require("./routes/health.routes");
const cors = require("cors");

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api/", limiter);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check routes (no rate limiting)
app.use("/", healthRoutes);

// API routes (with rate limiting)
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/phrase", phraseRoutes);
app.use("/api/practice-history", practiceHistoryRoutes);

module.exports = app;
