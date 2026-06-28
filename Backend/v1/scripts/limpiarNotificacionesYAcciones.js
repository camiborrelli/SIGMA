import mongoose from "mongoose";
import dotenv from "dotenv";

import Notificacion from "../models/Notificacion.js";
import AccionUsuario from "../models/accionUsuario.model.js";


dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);

console.log("Mongo conectado");


const notificaciones =
  await Notificacion.deleteMany({});


const acciones =
  await AccionUsuario.deleteMany({});



console.log(
  `Notificaciones eliminadas: ${notificaciones.deletedCount}`
);


console.log(
  `Acciones de usuario eliminadas: ${acciones.deletedCount}`
);



await mongoose.disconnect();

process.exit(0);