import mongoose, { Schema } from "mongoose";

export const AccionUsuarioSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
  accion: String,
  fecha: { type: Date, default: Date.now },
  recursoAfectado: String,
});

export default mongoose.model("AccionUsuario", AccionUsuarioSchema);
