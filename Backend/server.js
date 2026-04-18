import express from "express";
import cors from "cors";
import { connectDB } from "./v1/db.js";

import maquinariaRoutes from "./v1/routes/maquinaria.routes.js";
import usuarioRoutes from "./v1/routes/usuario.routes.js";
import obrasRoutes from "./v1/routes/obra.routes.js";

const app = express();

//Conexión DB
await connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/maquinaria", maquinariaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/obras", obrasRoutes);
// Rutas
app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
