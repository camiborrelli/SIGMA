import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no definido en .env");
  try {
    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");
  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
    throw err;
  }
}

export default mongoose;
