import mongoose, { Schema } from "mongoose";

const UnidadSchema = new Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipo",
    required: true,
  },
  identificador: { type: String, required: true }, //ej: EXC-001
  estado: {
    type: String,
    enum: ["Disponible", "Asignada", "En mantenimiento", "Dada de Baja"],
    default: "Disponible",
  },
  ubicacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Obra",
    default: null,
  },
  fechaCompra: Date,
});

export default mongoose.model("Unidad", UnidadSchema);