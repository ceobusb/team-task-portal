const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const taskRoutes = require("./src/routes/taskRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5052;

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Proje Çalışıyor");
});

app.use("/api/auth",authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);


app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server http://127.0.0.1:${PORT} adresinde calisiyor`);
});
