import mongoose, { Schema } from "mongoose";
import Obra from "./obra.model.js";

export const MaquinariaSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ["Maquina", "Herramienta"] },
  modelo: String,
  estado: {
    type: String,
    enum: ["Disponible", "Asignada", "Mantenimiento", "Debaja"],
    default: "Disponible",
  },
  stock: Number,
  fechaCompra: Date,
  ubicacion: Obra.id,
});

export default mongoose.model("Maquinaria", MaquinariaSchema);
