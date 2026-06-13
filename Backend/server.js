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

const app = express();

await connectDB();

const allowedOrigins = [
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

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SIGMA Backend funcionando",
  });
});

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});

app.use("/unidades", unidadRoutes);
app.use("/equipos", equipoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/obras", obrasRoutes);
app.use("/notificaciones", notificacionRoutes);
app.use("/solicitudes", solicitudRoutes);

export default app;
