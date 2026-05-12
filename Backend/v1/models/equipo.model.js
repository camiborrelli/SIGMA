import mongoose, { Schema } from "mongoose";

const EquipoSchema = new Schema({
  nombre: { type: String, required: true },
  modelo: { type: String, required: true },
  tipo: {
    type: String,
    enum: ["Maquina", "Herramienta"],
    required: true,
  },
});

export default mongoose.model("Equipo", EquipoSchema);
