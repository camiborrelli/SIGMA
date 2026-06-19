import mongoose from "mongoose";

const NotificacionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  mensaje: {
    type: String,
    required: true,
  },

  solicitudId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SolicitudTraslado",
  },

  unidadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unidad",
  },

  fechaVencimientoGarantia: {
    type: Date,
  },

  correoEnviado: {
    type: Boolean,
    default: false,
  },

  correoEnviadoAt: {
    type: Date,
  },

  leida: {
    type: Boolean,
    default: false,
  },

  tipo: {
    type: String,
    default: "sistema",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notificacion", NotificacionSchema);
