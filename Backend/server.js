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
import graficasRoutes from "./v1/routes/graficas.routes.js";

const app = express();
app.set("trust proxy", true);

await connectDB();
iniciarMonitorGarantiasPorVencer();

const allowedOrigins = [
  "https://sigma-front-five.vercel.app",
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
            body { font-family: Arial, sans-serif; background:#fff; color:#111; display:grid; min-height:100dvh; place-items:center; margin:0; padding:24px; box-sizing:border-box; }
            .card { background:#fff; padding:30px; border-radius:20px; width:min(400px, 100%); box-shadow:0 10px 30px rgba(0,0,0,.1); border:1px solid #f0f0f0; box-sizing:border-box; margin:0 auto; }
            h1 { color:#111; margin-top:0; text-align:center; }
            p { color:#666; line-height:1.5; text-align:center; }
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

  const host = req.get("host");
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();
  const requestProto = (forwardedProto || req.protocol || "https").replace(
    /:$/,
    "",
  );
  const protocol = /\.onrender\.com$/i.test(host) ? "https" : requestProto;
  const apiBase = `${protocol}://${host}`;

  return res.send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Restablecer contraseña - SIGMA</title>
        <style>
          body { font-family: Arial, sans-serif; background:#fff; color:#111; display:grid; min-height:100dvh; place-items:center; margin:0; padding:24px; box-sizing:border-box; }
          .card { background:#fff; padding:30px; border-radius:20px; width:min(400px, 100%); box-shadow:0 10px 30px rgba(0,0,0,.1); border:1px solid #f0f0f0; box-sizing:border-box; margin:0 auto; }
          h1 { margin-top:0; font-size:26px; text-align:center; color:#111; }
          p { color:#666; line-height:1.5; text-align:center; }
          label { display:block; margin:14px 0 6px; color:#111; font-size:14px; }
          input { width:100%; box-sizing:border-box; padding:10px; border-radius:10px; border:1px solid #ccc; background:#fff; color:#111; font-size:16px; }
          button { width:100%; margin-top:20px; padding:12px 16px; border:0; border-radius:10px; background:#c62828; color:#fff; font-weight:700; font-size:16px; cursor:pointer; }
          button:hover:not(:disabled) { background:#a61c1c; }
          button:disabled { background:#d98c8c; color:#fff; cursor:not-allowed; }
          .msg { margin-top:16px; min-height:24px; }
          .ok { color:#16803a; }
          .error { color:#c62828; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Restablecer contraseña</h1>
          <p>Ingresa tu nueva contraseña para completar el cambio.</p>
          <form id="form">
            <label for="nuevaContrasenia">Nueva contraseña</label>
            <input id="nuevaContrasenia" type="password" minlength="6" autocomplete="new-password" required />
            <label for="confirmarContrasenia">Confirmar contraseña</label>
            <input id="confirmarContrasenia" type="password" minlength="6" autocomplete="new-password" required />
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
app.use("/graficas", graficasRoutes);

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
