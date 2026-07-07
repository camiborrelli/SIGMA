import express from "express";
import { revisarGarantiasCronController } from "../controllers/cron.controller.js";

const router = express.Router();

const obtenerTokenBearer = (authorization = "") =>
  authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

const verificarCronSecret = (req, res, next) => {
  const secret = process.env.CRON_SECRET || process.env.GARANTIAS_CRON_SECRET;

  if (!secret) {
    return next();
  }

  const token =
    obtenerTokenBearer(req.headers.authorization || "") ||
    req.headers["x-cron-secret"];

  if (token !== secret) {
    return res.status(401).json({ error: "Cron no autorizado" });
  }

  next();
};

router.get("/garantias", verificarCronSecret, revisarGarantiasCronController);
router.post("/garantias", verificarCronSecret, revisarGarantiasCronController);

export default router;
