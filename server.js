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

// socket io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
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
