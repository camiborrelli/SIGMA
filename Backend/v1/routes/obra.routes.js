import express from "express";
import { registrarObraController } from "../controllers/obra.controller.js";
// import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarObraSchema } from "../validators/obra.validators.js";

const router = express.Router();

router.post("/", registrarObraController);

export default router;
