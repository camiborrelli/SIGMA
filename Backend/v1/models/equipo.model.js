import mongoose, { Schema } from "mongoose";

const EquipoSchema = new Schema({
  nombre: { type: String, required: true },
  modelo: String,
  tipo: {
    type: String,
    enum: ["Maquina", "Herramienta"],
  },
});

export default mongoose.model("Equipo", EquipoSchema);