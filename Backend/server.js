import express from "express";
import cors from "cors";
import { connectDB } from "./v1/db.js";
import dotenv from "dotenv";
dotenv.config();

import maquinariaRoutes from "./v1/routes/maquinaria.routes.js";
import usuarioRoutes from "./v1/routes/usuarioRoutes.js";

const app = express();

//Conexión DB
await connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/maquinaria", maquinariaRoutes);
app.use("/usuarios", usuarioRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});