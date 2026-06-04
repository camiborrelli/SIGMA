import express from "express";
import cors from "cors";
import { connectDB } from "./v1/db.js";

import equipoRoutes from "./v1/routes/equipo.routes.js"
import unidadRoutes from "./v1/routes/unidad.routes.js";
import usuarioRoutes from "./v1/routes/usuario.routes.js";
import obrasRoutes from "./v1/routes/obra.routes.js";
import notificacionRoutes from "./v1/routes/notificacion.routes.js";
import solicitudRoutes from "./v1/routes/solicitudTraslado.routes.js";

const app = express();

//Conexión DB
await connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/unidades", unidadRoutes);
app.use("/equipos", equipoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/obras", obrasRoutes);
app.use("/notificaciones", notificacionRoutes);
app.use("/solicitudes", solicitudRoutes);

// Rutas
app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
