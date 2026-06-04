import mongoose from "mongoose";

const SolicitudTrasladoSchema = new mongoose.Schema({
  funcionario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  obraOrigen: { type: mongoose.Schema.Types.ObjectId, ref: "Obra", required: true },
  obraDestino: { type: mongoose.Schema.Types.ObjectId, ref: "Obra", required: true },
  unidades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Unidad" }], 
  estado: {
  type: String,
  enum: ["Pendiente", "Aprobada", "Rechazada", "Completada"],
  default: "Pendiente"
  },
  procesadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  fechaProcesado: { type: Date }
}, { timestamps: true });

export default mongoose.model("SolicitudTraslado", SolicitudTrasladoSchema);