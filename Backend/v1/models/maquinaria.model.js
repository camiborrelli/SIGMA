import mongoose, { Schema } from "mongoose";
import Obra from "./obra.model.js";

export const MaquinariaSchema = new Schema({
  nombre: String,
  modelo: String,
  estado: {
    type: String,
    enum: ["Disponible", "Asignada", "Mantenimiento", "DeBbaja"],
    default: "Disponible",
  },
  stock: Number,
  fechaCompra: Date,
  ubicacion: String,
});

export default mongoose.model("Maquinaria", MaquinariaSchema);
