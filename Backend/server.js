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

const corsOrigin = (origin, callback) => {
  if (
    !origin ||
    allowedOrigins.includes(origin) ||
    /^https:\/\/sigma-front-[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)
  ) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origen no permitido por CORS: ${origin}`));
};

const corsHeaders = (req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      /^https:\/\/sigma-front-[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
      /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin))
  ) {
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

app.get("/restablecer-contrasenia", (req, res) => {
  const token = String(req.query.token || "").trim();

  if (!token) {
    return res.status(400).send(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Restablecer contraseña - SIGMA</title>
          <style>
            body { font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; display:flex; min-height:100vh; align-items:center; justify-content:center; margin:0; }
            .card { background:#111827; padding:24px; border-radius:16px; width:min(480px, calc(100vw - 32px)); box-shadow:0 20px 40px rgba(0,0,0,.35); }
            a { color:#38bdf8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link inválido</h1>
            <p>Falta el token de recuperación.</p>
          </div>
        </body>
      </html>
    `);
  }

  const apiBase = `${req.protocol}://${req.get("host")}`;

  return res.send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Restablecer contraseña - SIGMA</title>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #0f172a, #111827); color:#e2e8f0; display:flex; min-height:100vh; align-items:center; justify-content:center; margin:0; }
          .card { background:#111827; padding:28px; border-radius:18px; width:min(520px, calc(100vw - 32px)); box-shadow:0 20px 40px rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.06); }
          h1 { margin-top:0; font-size:28px; }
          p { color:#94a3b8; line-height:1.5; }
          label { display:block; margin:14px 0 6px; color:#cbd5e1; }
          input { width:100%; box-sizing:border-box; padding:12px 14px; border-radius:12px; border:1px solid #334155; background:#0f172a; color:#e2e8f0; font-size:16px; }
          button { width:100%; margin-top:18px; padding:12px 16px; border:0; border-radius:12px; background:#38bdf8; color:#0f172a; font-weight:700; font-size:16px; cursor:pointer; }
          button:disabled { opacity:.7; cursor:not-allowed; }
          .msg { margin-top:16px; min-height:24px; }
          .ok { color:#4ade80; }
          .error { color:#f87171; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Restablecer contraseña</h1>
          <p>Ingresa tu nueva contraseña para completar el cambio.</p>
          <form id="form">
            <label for="nuevaContrasenia">Nueva contraseña</label>
            <input id="nuevaContrasenia" type="password" minlength="6" required />
            <label for="confirmarContrasenia">Confirmar contraseña</label>
            <input id="confirmarContrasenia" type="password" minlength="6" required />
            <button id="btn" type="submit">Actualizar contraseña</button>
            <div id="msg" class="msg"></div>
          </form>
        </div>
        <script>
          const token = ${JSON.stringify(token)};
          const apiBase = ${JSON.stringify(apiBase)};
          const form = document.getElementById('form');
          const msg = document.getElementById('msg');
          const btn = document.getElementById('btn');

          const setMessage = (text, type) => {
            msg.textContent = text;
            msg.className = 'msg ' + (type || '');
          };

          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            btn.disabled = true;
            setMessage('Actualizando...', '');

            const nuevaContrasenia = document.getElementById('nuevaContrasenia').value;
            const confirmarContrasenia = document.getElementById('confirmarContrasenia').value;

            try {
              const response = await fetch(apiBase + '/usuarios/restablecer-contrasenia/' + encodeURIComponent(token), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nuevaContrasenia, confirmarContrasenia }),
              });

              const data = await response.json().catch(() => ({}));

              if (!response.ok) {
                throw new Error(data.error || 'No se pudo cambiar la contraseña');
              }

              setMessage('Contraseña actualizada correctamente. Ya puedes cerrar esta ventana.', 'ok');
              form.reset();
            } catch (error) {
              setMessage(error.message || 'Error al restablecer contraseña', 'error');
            } finally {
              btn.disabled = false;
            }
          });
        </script>
      </body>
    </html>
  `);
});

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
