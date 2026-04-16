export const ObraSchema = new Schema({
  nombre: String,
  ubicacion: String,
  fechaInicio: Date,
  fechaFin: Date,
  estado: {
    type: String,
    enum: ["Activa", "Finalizada", "Cancelada"],
    default: "Activa",
  },
  cantReactivaciones: { type: Number, default: 0 },
});

export default mongoose.model("Obra", ObraSchema);
