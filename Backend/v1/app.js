import express from "express";
import cors from "cors";

// Rutas
import unidadRoutes from "./routes/unidad.routes.js";
import equipoRoutes from "./routes/equipo.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import obraRoutes from "./routes/obra.routes.js";
import notificacionRoutes from "./routes/notificacion.routes.js";
import solicitudRoutes from "./routes/solicitudTraslado.routes.js";
import cronRoutes from "./routes/cron.routes.js";
import { getAccionesUsuarioController } from "./controllers/accionUsuario.controller.js";
import { verificarToken } from "./middlewares/auth.js";
import { soloAdmin } from "./middlewares/roles.js";
import { iniciarMonitorGarantiasPorVencer } from "./services/garantia.services.js";
import { connectDB } from "./db.js";

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
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get(
  "/accionesUsuario",
  verificarToken,
  soloAdmin,
  getAccionesUsuarioController,
);

app.use("/unidades", unidadRoutes);
app.use("/equipos", equipoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/obras", obraRoutes);
app.use("/notificaciones", notificacionRoutes);
app.use("/solicitudes", solicitudRoutes);
app.use("/cron", cronRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
