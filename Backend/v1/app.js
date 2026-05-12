import express from "express";
import cors from "cors";

//Rutas
import unidadRoutes from "./routes/unidad.routes.js";
import equipoRoutes from "./routes/equipo.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import obraRoutes from "./routes/obra.routes.js";

import { connectDB } from "./db.js";

const app = express();

//Conexión DB
await connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

//Rutas
app.use("/unidades", unidadRoutes);
app.use("/equipos", equipoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/obras", obraRoutes);

//Puerto
app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
