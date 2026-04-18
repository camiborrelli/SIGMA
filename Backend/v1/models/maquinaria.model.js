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
    enum: ["Disponible", "En mantenimiento", "Fuera de servicio", "Asignada"],
    default: "Disponible",
  },
  stock: Number,
  fechaCompra: Date,
  obra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Obra",
  },
});

export default mongoose.model("Maquinaria", MaquinariaSchema);
