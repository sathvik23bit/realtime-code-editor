require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_URL }));

// ✅ Add a simple test route for Render
app.get("/", (req, res) => {
  res.send("✅ Backend is running fine and ready for connections!");
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL } });

// 🧠 Store document content in memory
let documentContent = "// Start coding collaboratively!\n";

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send initial document to new user
  socket.emit("init", { text: documentContent });

  // Listen for changes from a user
  socket.on("change", (data) => {
    documentContent = data.text; // Update server-side document
    // Broadcast changes to all other users
    socket.broadcast.emit("update", { text: documentContent });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
