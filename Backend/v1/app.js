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
import graficasRoutes from "./routes/graficas.routes.js";
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

const esOrigenPermitido = (origin) =>
  !origin ||
  allowedOrigins.includes(origin) ||
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin) ||
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
  /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);

const corsOrigin = (origin, callback) => {
  if (esOrigenPermitido(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origen no permitido por CORS: ${origin}`));
};

const corsHeaders = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && esOrigenPermitido(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] ||
        "Content-Type, Authorization",
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
};

app.use(corsHeaders);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.options(
  "*",
  cors({ origin: corsOrigin, credentials: true, optionsSuccessStatus: 200 }),
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
app.use("/graficas", graficasRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
