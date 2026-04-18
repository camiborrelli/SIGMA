import express from "express";
import { registrarObraController } from "../controllers/obra.controller.js";

const router = express.Router();

router.post("/", registrarObraController);

export default router;
