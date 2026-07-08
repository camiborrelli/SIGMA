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

  pushIntentadoAt: {
    type: Date,
  },

  pushEnviadoAt: {
    type: Date,
  },

  pushTokensIntentados: {
    type: Number,
    default: 0,
  },

  pushErrores: {
    type: Number,
    default: 0,
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
