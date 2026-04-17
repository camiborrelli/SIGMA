import express from "express";
<<<<<<< HEAD
import { register,login } from "../controllers/usuarioController.js";
=======
import { register } from "../controllers/usuarioController.js";
>>>>>>> 89538b8 (RegistrarEquiposFix)

const router = express.Router();

router.post("/register", register);
<<<<<<< HEAD
router.post("/login", login);
=======
>>>>>>> 89538b8 (RegistrarEquiposFix)

export default router;