import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser"; // Adicionado

import studentRoutes from "./routes/studentRoutes";
import coordinatorRoutes from "./routes/coordinatorRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Defina a URL exata do seu front Vite
    credentials: true, // Permite o envio de cookies/headers de autenticação
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/student", studentRoutes);
app.use("/api/coordinator", coordinatorRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/gestor-certificados";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));
