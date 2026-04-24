import express from "express";
import {
  registrarObraController,
  getObraPorIdController,
  getObrasController,
} from "../controllers/obra.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:id", verificarToken, getObraPorIdController);
router.get("/", verificarToken, getObrasController);
router.post("/", verificarToken, registrarObraController);

export default router;
