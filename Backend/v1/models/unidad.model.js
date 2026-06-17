import mongoose, { Schema } from "mongoose";

const UnidadSchema = new Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipo",
    required: true,
  },
  descripcion: { type: String, default: "" },
  etiqueta: { type: Number, default: null },
  identificador: { type: String, required: true },
  estado: {
    type: String,
    enum: ["Disponible", "Asignada", "En mantenimiento", "Dada de Baja"],
    default: "Disponible",
  },
  cantReparaciones: { type: Number, default: 0 },
  ubicacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Obra",
    default: null,
  },
  fechaCompra: Date,
  historialMantenimiento: [
    {
      fechaInicio: Date,
      fechaFin: Date,
      usuario: { type: String, default: null },
      foto: { type: String, default: null },
      destino: { type: String, default: null },
      comentarios: [
        {
          texto: String,
          fecha: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

export default mongoose.model("Unidad", UnidadSchema);
