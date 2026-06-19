import XLSX from "xlsx";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { registrarObraServices } from "../services/obra.services.js";


dotenv.config();


// conectar MongoDB
await mongoose.connect(process.env.MONGODB_URI);


console.log("Base conectada");


// leer excel
const workbook = XLSX.readFile(
  "v1/scripts/ubicacionObras.xlsx"
);


const hoja = workbook.Sheets[workbook.SheetNames[0]];


const obras = XLSX.utils.sheet_to_json(hoja);


console.log(`Obras encontradas: ${obras.length}`);



for (const fila of obras) {

  try {


    const coordenadas = fila.UBICACIÓN.split(",");


    await registrarObraServices({

      nombre: fila.OBRA,

      latitud: Number(coordenadas[0]),

      longitud: Number(coordenadas[1]),

      ubicacion: fila.UBICACIÓN,

      fechaInicio: null,

      fechaFin: null,

      estado: "Activa"

    });


    console.log(
      "✓ Creada:",
      fila.OBRA
    );


  } catch(error){


    console.log(
      "✗ Error:",
      fila.OBRA,
      error.message
    );


  }

}



console.log("Importación finalizada");


process.exit();