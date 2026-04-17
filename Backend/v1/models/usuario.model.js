import mongoose, { Schema } from "mongoose";

export const UsuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    rol: {
      type: String,
      enum: ["Admin", "Funcionario"],
      default: "Funcionario",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Usuario", UsuarioSchema);