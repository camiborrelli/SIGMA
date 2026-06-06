import mongoose, { Schema } from "mongoose";

export const AccionUsuarioSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  accion: {
    type: String,
    required: true,
  },

  fecha: {
    type: Date,
    default: Date.now,
  },

  recursoAfectado: {
    type: String,
    required: true,
  },

  detalles: {
    type: Schema.Types.Mixed,
    default: {},
  },
});

export default mongoose.model("AccionUsuario", AccionUsuarioSchema);