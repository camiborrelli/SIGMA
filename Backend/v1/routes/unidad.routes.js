import express from "express";
import {
  getUnidadesPorEquipoController,
  bajaUnidadController,
  agregarUnidadController,
  enviarAMantenimientoController,
  finalizarMantenimientoController,
  getGarantiaUnidadController,
  getGarantiasPorVencerController,
  getStatsUnidadesController,
  getReparacionesUnidadController,
  asignarUnidadController,
  eliminarUnidadController,
  actualizarFechaCompraController,
  trasladarUnidadesController,
  quitarUnidadDeObraController,
  asignarMultiplesUnidadesController,
  asignarFechaCompraMultiplesUnidadesController,
  bajaMultiplesUnidadesController,
  actualizarDescripcionUnidadController,
  actualizarEtiquetaUnidadController,
  getUnidadesController,
  getUnidadesMantenimientoController,
  agregarComentarioMantenimientoController,
  revisarGarantiasPorVencerController,
} from "../controllers/unidad.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { soloAdmin } from "../middlewares/roles.js";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

const upload = multer({ storage: storage });
const router = express.Router();

router.get("/equipo/:equipoId", verificarToken, getUnidadesPorEquipoController);
router.get("/", verificarToken, getUnidadesController);
router.get(
  "/mantenimiento",
  verificarToken,
  getUnidadesMantenimientoController,
);
router.post("/baja/:id", verificarToken, bajaUnidadController);
router.post(
  "/mantenimiento/:id",
  verificarToken,
  upload.single("foto"),
  enviarAMantenimientoController,
);
router.post(
  "/:id/comentario-mantenimiento",
  verificarToken,
  agregarComentarioMantenimientoController,
);
router.post(
  "/mantenimiento/finalizar/:id",
  verificarToken,
  finalizarMantenimientoController,
);
router.post("/agregar/:equipoId", verificarToken, agregarUnidadController);

router.post("/asignar/:id", verificarToken, asignarUnidadController);
router.delete("/:id", verificarToken, eliminarUnidadController);

router.get(
  "/garantias/por-vencer",
  verificarToken,
  getGarantiasPorVencerController,
);
router.post(
  "/garantias/revisar",
  verificarToken,
  soloAdmin,
  revisarGarantiasPorVencerController,
);
router.get("/garantia/:id", verificarToken, getGarantiaUnidadController);
router.get("/stats", verificarToken, getStatsUnidadesController);
router.get(
  "/:id/reparaciones",
  verificarToken,
  getReparacionesUnidadController,
);
router.put(
  "/fecha-compra/:id",
  verificarToken,
  actualizarFechaCompraController,
);
router.post(
  "/quitar-de-obra/:idUnidad/:idObra",
  verificarToken,
  quitarUnidadDeObraController,
);
router.post("/trasladar", verificarToken, trasladarUnidadesController);
router.post(
  "/asignar-obra-multiples",
  verificarToken,
  asignarMultiplesUnidadesController,
);
router.post(
  "/actualizar-multiples",
  verificarToken,
  asignarFechaCompraMultiplesUnidadesController,
);
router.post("/baja-multiple", verificarToken, bajaMultiplesUnidadesController);
router.put(
  "/descripcion/:id",
  verificarToken,
  actualizarDescripcionUnidadController,
);
router.put("/etiqueta/:id", verificarToken, actualizarEtiquetaUnidadController);

export default router;
