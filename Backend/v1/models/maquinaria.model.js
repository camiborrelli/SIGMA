import mongoose, { Schema } from "mongoose";
import Obra from "./obra.model.js";

export const MaquinariaSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ["Maquina", "Herramienta"] },
  modelo: String,
  tipo: {
    type: String,
    enum: ["Maquina", "Herramienta"],
  },
  estado: {
    type: String,
    enum: ["Disponible", "En mantenimiento", "Dada de baja", "Asignada"],
    default: "Disponible",
  },
  stock: Number,
  fechaCompra: Date,
  ubicacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Obra",
    default: null,
  },
  cantReparaciones: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Maquinaria", MaquinariaSchema);
