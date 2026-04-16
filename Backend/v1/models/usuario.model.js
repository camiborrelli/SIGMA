import { Schema } from "mongoose";

export const UsuarioSchema = new Schema({
  nombre: String,
  apellido: String,
  email: String,
  password: String,
  rol: { type: String, enum: ["Admin", "Funcionario"], default: "Funcionario" },
});

export default mongoose.model("Usuario", UsuarioSchema);
