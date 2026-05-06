import mongoose, { Schema } from "mongoose";

export const ObraSchema = new Schema({
  nombre: { type: String, required: true, minlength: 1, trim: true },
  ubicacion: { type: String, required: true, minlength: 1, trim: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  estado: {
    type: String,
    enum: ["Activa", "Finalizada", "Cancelada"],
    default: "Activa",
  },
  cantReactivaciones: { type: Number, default: 0 },
});

// Evitar duplicados por nombre + ubicacion (insensible a mayúsculas/minúsculas)
ObraSchema.index(
  { nombre: 1, ubicacion: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export default mongoose.model("Obra", ObraSchema);
