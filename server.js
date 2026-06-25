const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");
const projectRoutes = require("./src/routes/project.routes");
const { setupSocket } = require("./src/socket/codeRunner");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://codelab-peach.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

// socket io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CodeLab server is running!" });
});

// Serve static assets in production
const path = require("path");
app.use(express.static(path.join(__dirname, "client/dist")));

// Fallback all other routes to React client index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

// socket setup for running code
setupSocket(io);

// connect to mongodb and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
