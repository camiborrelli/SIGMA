import mongoose from "mongoose";
import dotenv from "dotenv";

import Usuario from "../models/usuario.model.js";


dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);

console.log("Mongo conectado");



const resultado = await Usuario.deleteMany({
  email: {
    $nin: [
      "camiborrelli15@gmail.com",
      "juli@rosas.com"
    ]
  }
});


console.log(
  `Usuarios eliminados: ${resultado.deletedCount}`
);



await mongoose.disconnect();

process.exit(0);