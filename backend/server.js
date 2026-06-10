const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");


const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const { setSocketServer } = require("./src/socket");


dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5052;

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setSocketServer(io);

io.on("connection", (socket) => {
  console.log("Yeni socket baglandi:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket ayrildi:", socket.id);
  });
});


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Proje Calisiyor");
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server http://127.0.0.1:${PORT} adresinde calisiyor`);
});
