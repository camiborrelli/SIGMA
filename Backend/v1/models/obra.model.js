import mongoose, { Schema } from "mongoose";

export const ObraSchema = new Schema({
  nombre: { type: String, required: true, minlength: 1, trim: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  estado: {
    type: String,
    enum: ["Activa", "Finalizada", "Cancelada"],
    default: "Activa",
  },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  ubicacion: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  descripcion: { type: String, default: "" },
  cantReactivaciones: { type: Number, default: 0 },
});

// Evitar duplicados por nombre + ubicacion (insensible a mayúsculas/minúsculas)
ObraSchema.index(
  { nombre: 1, latitud: 1, longitud: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export default mongoose.model("Obra", ObraSchema);
