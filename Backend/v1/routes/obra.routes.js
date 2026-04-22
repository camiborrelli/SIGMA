import express from "express";
import {
  registrarObraController,
  getObraPorIdController,
  getObrasController,
} from "../controllers/obra.controller.js";

const router = express.Router();

router.get("/:id", getObraPorIdController);
router.get("/", getObrasController);
router.post("/", registrarObraController);

export default router;
