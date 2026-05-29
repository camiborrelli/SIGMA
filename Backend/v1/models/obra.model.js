import mongoose, { Schema } from "mongoose";

export const ObraSchema = new Schema({
  nombre: { type: String, required: true, minlength: 1, trim: true },
  fechaInicio: { type: Date, required: false },
  fechaFin: { type: Date, required: false },
  estado: {
    type: String,
    enum: ["Activa", "Finalizada", "Cancelada"],
    default: "Activa",
  },
  latitud: { type: Number, required: false },
  longitud: { type: Number, required: false },
  ubicacion: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // descripcion: { type: String, required: false, trim: true },
  cantReactivaciones: { type: Number, default: 0 },
});

// Evitar duplicados por nombre + ubicacion (insensible a mayúsculas/minúsculas)
ObraSchema.index(
  { nombre: 1, latitud: 1, longitud: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export default mongoose.model("Obra", ObraSchema);
