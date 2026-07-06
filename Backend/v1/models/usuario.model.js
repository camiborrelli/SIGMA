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
    estado: {
      type: String,
      enum: ["Activo", "Inactivo"],
      default: "Activo",
    },
    pushTokens: [
      {
        token: {
          type: String,
          required: true,
          trim: true,
        },
        platform: {
          type: String,
          enum: ["android", "ios", "web", "unknown"],
          default: "unknown",
        },
        deviceName: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastSeenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Usuario", UsuarioSchema);
