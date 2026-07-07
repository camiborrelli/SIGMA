import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./v1/db.js";
import equipoRoutes from "./v1/routes/equipo.routes.js";
import unidadRoutes from "./v1/routes/unidad.routes.js";
import usuarioRoutes from "./v1/routes/usuario.routes.js";
import obrasRoutes from "./v1/routes/obra.routes.js";
import notificacionRoutes from "./v1/routes/notificacion.routes.js";
import solicitudRoutes from "./v1/routes/solicitudTraslado.routes.js";
import cronRoutes from "./v1/routes/cron.routes.js";
import { getAccionesUsuarioController } from "./v1/controllers/accionUsuario.controller.js";
import { verificarToken } from "./v1/middlewares/auth.js";
import { soloAdmin } from "./v1/middlewares/roles.js";
import { iniciarMonitorGarantiasPorVencer } from "./v1/services/garantia.services.js";

const app = express();

await connectDB();
iniciarMonitorGarantiasPorVencer();

const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:19000",
  "http://localhost:19006",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sigma-front-five.vercel.app",
  "https://sigma-front-git-develop-camilas-projects-2b00654e.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SIGMA Backend funcionando",
  });
});

app.get(
  "/accionesUsuario",
  verificarToken,
  soloAdmin,
  getAccionesUsuarioController,
);

app.use("/unidades", unidadRoutes);
app.use("/equipos", equipoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/obras", obrasRoutes);
app.use("/notificaciones", notificacionRoutes);
app.use("/solicitudes", solicitudRoutes);
app.use("/cron", cronRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${PORT} ya esta en uso`);
    process.exit(1);
  }

  throw error;
});

export default app;
