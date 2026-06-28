import XLSX from "xlsx";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Equipo from "../models/equipo.model.js";
import Unidad from "../models/unidad.model.js";

import { crearEquipoConUnidades } from "../services/equipo.services.js";


dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);

console.log("Mongo conectado");


// limpiar primero
const unidadesBorradas = await Unidad.deleteMany({});
const equiposBorrados = await Equipo.deleteMany({});

console.log(`Unidades eliminadas: ${unidadesBorradas.deletedCount}`);
console.log(`Equipos eliminados: ${equiposBorrados.deletedCount}`);



const workbook = XLSX.readFile(
  "v1/scripts/INVENTARIO 2022.xlsx"
);


const hoja = workbook.Sheets["CANTIDADES TOTALES"];


const datos = XLSX.utils.sheet_to_json(
  hoja,
  {
    header: 1,
    defval: 0
  }
);



let totalEquipos = 0;
let totalUnidades = 0;



for(let i = 2; i < datos.length; i++){

    const fila = datos[i];


    const nombre = fila[2];


    if(!nombre) continue;



    let cantidadTotal = 0;


    // sumar todas las columnas de cantidad
    for(let j = 3; j < fila.length; j++){

        cantidadTotal += Number(fila[j]) || 0;

    }



    if(cantidadTotal <= 0)
        continue;




    let tipo = "Herramienta";


    const nombreUpper = nombre.toUpperCase();


    if(
      nombreUpper.includes("BOMBA") ||
      nombreUpper.includes("GENERADOR") ||
      nombreUpper.includes("SOLDADORA") ||
      nombreUpper.includes("COMPRESOR") ||
      nombreUpper.includes("TALADRO")
    ){

      tipo = "Maquina";

    }



    const resultado =
    await crearEquipoConUnidades({

        nombre,

        modelo:"Sin modelo",

        tipo,

        cantidad:cantidadTotal

    });



    console.log(
      `✓ ${nombre}: ${cantidadTotal} unidades`
    );


    totalEquipos++;
    totalUnidades += cantidadTotal;

}



console.log("----------------");
console.log(`Equipos creados: ${totalEquipos}`);
console.log(`Unidades creadas: ${totalUnidades}`);
console.log("----------------");



await mongoose.disconnect();

process.exit(0);