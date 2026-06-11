import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI no definido");
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar MongoDB:", error);
    throw error;
  }
}

export default mongoose;