import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

import maquinariaRoutes from "./routes/maquinaria.routes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await connectDB();

    //Rutas
    app.use("/maquinaria", maquinariaRoutes);
    app.use("/usuarios", usuarioRoutes);

    app.listen(5001, () => {
      console.log("Servidor corriendo en puerto 5001");
    });
  } catch (error) {
    console.error("Error al iniciar:", error);
  }
};

startServer();