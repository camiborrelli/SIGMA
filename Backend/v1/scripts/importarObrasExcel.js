import XLSX from "xlsx";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { registrarObraServices } from "../services/obra.services.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Base conectada");

const workbook = XLSX.readFile("v1/scripts/ubicacionObras.xlsx");
const hoja = workbook.Sheets[workbook.SheetNames[0]];
const obras = XLSX.utils.sheet_to_json(hoja);

console.log(`Obras encontradas: ${obras.length}`);

// 🔥 reverse geocoding
const reverseGeocode = async (lat, lon) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "SIGMA-App/1.0",
        "Accept-Language": "es",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.display_name;
};

for (const fila of obras) {
  try {
    const coordenadas = fila.UBICACIÓN.split(",");

    const lat = Number(coordenadas[0]);
    const lon = Number(coordenadas[1]);

    // 🔥 obtener dirección real
    const ubicacionReal = await reverseGeocode(lat, lon);

    await registrarObraServices({
      nombre: fila.OBRA,
      latitud: lat,
      longitud: lon,
      ubicacion: ubicacionReal || fila.UBICACIÓN,
      fechaInicio: null,
      fechaFin: null,
      estado: "Activa",
    });

    console.log("✓ Creada:", fila.OBRA);

    // ⚠️ importante para no saturar Nominatim
    await new Promise((r) => setTimeout(r, 1000));

  } catch (error) {
    console.log("✗ Error:", fila.OBRA, error.message);
  }
}

console.log("Importación finalizada");
process.exit();